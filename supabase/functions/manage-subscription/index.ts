import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { apiGeneralLimiter } from '../_shared/rate-limiter.ts';

interface Database {
  public: {
    Tables: {
      user_access: {
        Row: {
          id: string;
          email: string;
          access_token: string;
          stripe_customer_id: string | null;
          status: 'trialing' | 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

// Secure handler using the security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  try {
    const { action, email } = await req.json();
    
    if (!action || !email || typeof action !== 'string' || typeof email !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing action or email' 
      }), { 
        status: 400, 
        headers: responseHeaders
      });
    }

    // Initialize Stripe and Supabase
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('user_access')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    // For delete_account, we allow it even if user doesn't exist
    if (action === 'delete_account') {
      if (user && user.stripe_customer_id) {
        // Cancel subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 10,
        });

        for (const subscription of subscriptions.data) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await stripe.subscriptions.cancel(subscription.id);
          }
        }
      }

      // Delete user data
      await supabase.from('user_access').delete().eq('email', email.toLowerCase().trim());
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Account successfully deleted' 
      }), {
        status: 200,
        headers: responseHeaders
      });
    }

    // Auto-create missing user records for authenticated users
    // This handles cases where webhook failed during payment/signup
    let userRecord = user;
    if (userError || !user) {
      console.log(`User not found for subscription action: ${email}, attempting auto-creation...`);
      
      try {
        // Generate new access token
        const accessToken = crypto.randomUUID();
        
        // Create user record with trialing status
        // Stripe customer ID will be added later by webhook or manual process
        const { data: newUser, error: createError } = await supabase
          .from('user_access')
          .insert({
            email: email.toLowerCase().trim(),
            access_token: accessToken,
            stripe_customer_id: null, // Will be populated by webhook when it works
            status: 'trialing' // Default to trialing for new auto-created users
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Failed to auto-create user for subscription:', createError);
          
          // If auto-creation fails, return the original error message
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'User not found',
            debug: `Auto-creation failed: ${createError.message}`
          }), {
            status: 404,
            headers: responseHeaders
          });
        }

        console.log(`Successfully auto-created user for subscription: ${email} with token: ${accessToken}`);
        userRecord = newUser; // Use the newly created user
        
      } catch (autoCreateError) {
        console.error('Auto-creation exception in subscription:', autoCreateError);
        
        // Fall back to original error message
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }), {
          status: 404,
          headers: responseHeaders
        });
      }
    }

    // Now we have a valid user record (either existing or auto-created)
    const finalUser = userRecord;

    switch (action) {
      case 'get_subscription_status': {
        let subscriptionData = {
          status: finalUser.status,
          plan: 'Pro Plan',
          amount: 499,
          interval: 'month',
          trial_end: null as string | null,
          current_period_end: null as string | null,
          cancel_at_period_end: false,
        };

        if (finalUser.stripe_customer_id) {
          try {
            const subscriptions = await stripe.subscriptions.list({
              customer: finalUser.stripe_customer_id,
              status: 'all',
              limit: 1,
            });

            const subscription = subscriptions.data[0];
            if (subscription) {
              subscriptionData = {
                ...subscriptionData,
                status: subscription.status === 'trialing' ? 'trialing' : 
                       subscription.status === 'active' ? 'active' : 'inactive',
                trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
                cancel_at_period_end: subscription.cancel_at_period_end,
              };
            }
          } catch (stripeError) {
            console.log('Stripe error (using database status):', stripeError);
            
            // If customer doesn't exist in Stripe, clean up the orphaned customer ID
            if (stripeError.code === 'resource_missing') {
              console.log('Cleaning up orphaned customer ID:', finalUser.stripe_customer_id);
              await supabase
                .from('user_access')
                .update({ stripe_customer_id: null })
                .eq('email', email.toLowerCase().trim());
            }
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          subscription: subscriptionData 
        }), {
          status: 200,
          headers: responseHeaders
        });
      }

      case 'create_customer_portal': {
        if (!finalUser.stripe_customer_id) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'No Stripe customer ID found' 
          }), {
            status: 400,
            headers: responseHeaders
          });
        }

        try {
          const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'http://localhost:5173';
          
          const session = await stripe.billingPortal.sessions.create({
            customer: finalUser.stripe_customer_id,
            return_url: `${baseUrl}/account`,
          });

          return new Response(JSON.stringify({ 
            success: true, 
            url: session.url 
          }), {
            status: 200,
            headers: responseHeaders
          });
        } catch (stripeError) {
          // If customer doesn't exist in Stripe, clean up the orphaned customer ID
          if (stripeError.code === 'resource_missing') {
            console.log('Cleaning up orphaned customer ID in portal:', finalUser.stripe_customer_id);
            await supabase
              .from('user_access')
              .update({ stripe_customer_id: null })
              .eq('email', email.toLowerCase().trim());
          }
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Customer not found in Stripe' 
          }), {
            status: 400,
            headers: responseHeaders
          });
        }
      }

      case 'cancel_subscription': {
        // Handle users without Stripe customer ID (auto-created users or webhook failures)
        if (!finalUser.stripe_customer_id) {
          // For users without Stripe customer ID, just update database status to inactive
          // This handles cases where user completed checkout but webhook failed to populate customer ID
          await supabase
            .from('user_access')
            .update({ status: 'inactive' })
            .eq('email', email.toLowerCase().trim());
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Your trial has been cancelled' 
          }), {
            status: 200,
            headers: responseHeaders
          });
        }

        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: finalUser.stripe_customer_id,
            status: 'all',
            limit: 10,
          });

          const activeSubscription = subscriptions.data.find(sub => 
            sub.status === 'active' || sub.status === 'trialing'
          );

          if (!activeSubscription) {
            // No Stripe subscription found, but user exists in database
            // Cancel by updating database status
            await supabase
              .from('user_access')
              .update({ status: 'inactive' })
              .eq('email', email.toLowerCase().trim());
            
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Your trial has been cancelled' 
            }), {
              status: 200,
              headers: responseHeaders
            });
          }

          if (activeSubscription.status === 'trialing') {
            await stripe.subscriptions.cancel(activeSubscription.id);
            await supabase.from('user_access').update({ status: 'inactive' }).eq('email', email.toLowerCase().trim());
            
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Your trial has been cancelled' 
            }), {
              status: 200,
              headers: responseHeaders
            });
          } else {
            await stripe.subscriptions.update(activeSubscription.id, {
              cancel_at_period_end: true
            });

            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Subscription will be cancelled at the end of the billing period' 
            }), {
              status: 200,
              headers: responseHeaders
            });
          }
        } catch (stripeError) {
          console.error('Stripe error during cancellation:', stripeError);
          
          // If customer doesn't exist in Stripe, clean up the orphaned customer ID and cancel in database
          if (stripeError.code === 'resource_missing') {
            console.log('Cleaning up orphaned customer ID and cancelling trial:', finalUser.stripe_customer_id);
            await supabase
              .from('user_access')
              .update({ 
                stripe_customer_id: null,
                status: 'inactive'
              })
              .eq('email', email.toLowerCase().trim());
            
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Your trial has been cancelled' 
            }), {
              status: 200,
              headers: responseHeaders
            });
          }
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to cancel subscription' 
          }), {
            status: 400,
            headers: responseHeaders
          });
        }
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: responseHeaders
        });
    }

  } catch (error) {
    console.error('Subscription management error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: responseHeaders
    });
  }
}, {
  allowedMethods: ['POST', 'OPTIONS'],
  rateLimiter: apiGeneralLimiter,
  requireValidOrigin: false
});

Deno.serve(secureHandler); 