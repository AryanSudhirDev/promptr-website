import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { apiGeneralLimiter } from '../_shared/rate-limiter.ts';
import { InputValidator, createValidationErrorResponse } from '../_shared/validation.ts';

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

// Secure handler using the new security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  try {
    // Parse request body
    let requestData: { action: string; email: string };
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }), 
        { 
          status: 400, 
          headers: responseHeaders
        }
      );
    }

    // Validate request body structure
    const bodyValidation = InputValidator.validateRequestBody(requestData, ['action', 'email']);
    if (!bodyValidation.isValid) {
      return createValidationErrorResponse(bodyValidation.errors, responseHeaders);
    }

    // Validate action
    const actionValidation = InputValidator.validateAction(requestData.action);
    if (!actionValidation.isValid) {
      return createValidationErrorResponse(actionValidation.errors, responseHeaders);
    }

    // Validate email
    const emailValidation = InputValidator.validateEmail(requestData.email);
    if (!emailValidation.isValid) {
      return createValidationErrorResponse(emailValidation.errors, responseHeaders);
    }

    const action = actionValidation.sanitized;
    const email = emailValidation.sanitized;

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
      .eq('email', email)
      .single();

    if (userError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!user.stripe_customer_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No Stripe customer ID found' 
      }), {
        status: 400,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'get_subscription_status': {
        // Check if customer exists in Stripe, if not return database status
        let customer;
        let subscriptions;
        
        try {
          customer = await stripe.customers.retrieve(user.stripe_customer_id);
          subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: 'all',
            limit: 1,
          });
        } catch (stripeError) {
          // Customer doesn't exist in Stripe, return database status
          console.log('Customer not found in Stripe, using database status:', user.stripe_customer_id);
          return new Response(JSON.stringify({ 
            success: true, 
            subscription: {
              status: user.status,
              plan: 'Pro Plan',
              amount: 499,
              interval: 'month',
              trial_end: null,
              current_period_end: null,
              cancel_at_period_end: false,
            }
          }), {
            status: 200,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        }

        const subscription = subscriptions.data[0];
        
        let subscriptionData = {
          status: user.status,
          plan: 'Pro Plan',
          amount: 499, // $4.99 in cents
          interval: 'month',
          trial_end: null as string | null,
          current_period_end: null as string | null,
          cancel_at_period_end: false,
        };

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

        return new Response(JSON.stringify({ 
          success: true, 
          subscription: subscriptionData 
        }), {
          status: 200,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'create_customer_portal': {
        try {
          // Create customer portal session for payment method updates
          const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'http://localhost:5173';
          
          const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${baseUrl}/account`,
          });

          return new Response(JSON.stringify({ 
            success: true, 
            url: session.url 
          }), {
            status: 200,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        } catch (stripeError) {
          console.log('Customer portal error:', stripeError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Customer not found in Stripe. Please contact support.' 
          }), {
            status: 400,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'cancel_subscription': {
        try {
          // Get all subscriptions (active and trialing)
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: 'all',
            limit: 10,
          });

        // Find the first active or trialing subscription
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );

        if (!activeSubscription) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'No active or trial subscription found' 
          }), {
            status: 400,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        }

        // If it's a trial, cancel immediately. If it's active, cancel at period end
        if (activeSubscription.status === 'trialing') {
          // For trials, cancel immediately
          const cancelledSubscription = await stripe.subscriptions.cancel(activeSubscription.id);
          
          // Update database status to show trial is cancelled
          await supabase
            .from('user_access')
            .update({ status: 'inactive' })
            .eq('email', email);

          const message = 'Your trial has been cancelled. You can still use Promptr until your trial period ends.';
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: message,
            subscription: {
              cancel_at_period_end: true,  // Mark as cancelled for frontend
              current_period_end: cancelledSubscription.current_period_end ? new Date(cancelledSubscription.current_period_end * 1000).toISOString() : null,
              trial_end: cancelledSubscription.trial_end ? new Date(cancelledSubscription.trial_end * 1000).toISOString() : null,
              cancelled_at: new Date(cancelledSubscription.canceled_at! * 1000).toISOString()
            }
          }), {
            status: 200,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          // For active subscriptions, cancel at period end
          const updatedSubscription = await stripe.subscriptions.update(activeSubscription.id, {
            cancel_at_period_end: true
          });

          const message = 'Subscription will be cancelled at the end of the current billing period';

          return new Response(JSON.stringify({ 
            success: true, 
            message: message,
            subscription: {
              cancel_at_period_end: updatedSubscription.cancel_at_period_end,
              current_period_end: updatedSubscription.current_period_end ? new Date(updatedSubscription.current_period_end * 1000).toISOString() : null,
              trial_end: updatedSubscription.trial_end ? new Date(updatedSubscription.trial_end * 1000).toISOString() : null
            }
          }), {
            status: 200,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        }
        } catch (stripeError) {
          console.log('Subscription cancellation error:', stripeError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Customer not found in Stripe. Please contact support.' 
          }), {
            status: 400,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'delete_account': {
        try {
          // First, cancel any active subscription
          if (user.stripe_customer_id) {
            const subscriptions = await stripe.subscriptions.list({
              customer: user.stripe_customer_id,
              status: 'active',
              limit: 10,
            });

            // Cancel all active subscriptions
            for (const subscription of subscriptions.data) {
              await stripe.subscriptions.cancel(subscription.id);
              console.log('Cancelled subscription:', subscription.id);
            }

            // Also cancel trialing subscriptions
            const trialingSubscriptions = await stripe.subscriptions.list({
              customer: user.stripe_customer_id,
              status: 'trialing',
              limit: 10,
            });

            for (const subscription of trialingSubscriptions.data) {
              await stripe.subscriptions.cancel(subscription.id);
              console.log('Cancelled trialing subscription:', subscription.id);
            }
          }

          // Delete user data from database
          const { error: deleteError } = await supabase
            .from('user_access')
            .delete()
            .eq('email', email);

          if (deleteError) {
            console.error('Error deleting user data:', deleteError);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to delete user data' 
            }), {
              status: 500,
              headers: { ...responseHeaders, 'Content-Type': 'application/json' }
            });
          }

          console.log('Successfully deleted account for:', email);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Account successfully deleted. All subscriptions have been cancelled and user data has been removed.' 
          }), {
            status: 200,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' }
          });

        } catch (stripeError) {
          console.error('Account deletion error:', stripeError);
          
          // Still try to delete from database even if Stripe operations fail
          try {
            await supabase
              .from('user_access')
              .delete()
              .eq('email', email);
            
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Account deleted. Some subscription cancellation operations may have failed, but user data has been removed.' 
            }), {
              status: 200,
              headers: { ...responseHeaders, 'Content-Type': 'application/json' }
            });
          } catch (dbError) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to delete account data' 
            }), {
              status: 500,
              headers: { ...responseHeaders, 'Content-Type': 'application/json' }
            });
          }
        }
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Subscription management error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 