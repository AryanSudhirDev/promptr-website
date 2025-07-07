import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { webhooksLimiter } from '../_shared/rate-limiter.ts';

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
        Insert: {
          id?: string;
          email: string;
          access_token?: string;
          stripe_customer_id?: string | null;
          status?: 'trialing' | 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          access_token?: string;
          stripe_customer_id?: string | null;
          status?: 'trialing' | 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Secure webhook handler
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  try {
    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client with service role key
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing signature', { 
        status: 400, 
        headers: responseHeaders 
      });
    }

    // Use async verification for edge runtime compatibility
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { 
        status: 400, 
        headers: responseHeaders 
      });
    }

    console.log('Processing webhook event:', event.type);

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.customer || !session.customer_email) {
          console.error('Missing customer information in checkout session');
          break;
        }

        const customerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer.id;
        const email = session.customer_email;

        console.log('Processing checkout completion for:', email);

        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('user_access')
          .select('*')
          .eq('email', email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user:', fetchError);
          break;
        }

        if (existingUser) {
          // Update existing user with Stripe customer ID and set to trialing
          const { error: updateError } = await supabase
            .from('user_access')
            .update({
              stripe_customer_id: customerId,
              status: 'trialing'
            })
            .eq('email', email);

          if (updateError) {
            console.error('Error updating existing user:', updateError);
          } else {
            console.log('Updated existing user to trialing status:', email);
          }
        } else {
          // Create new user with access token
          const { error: insertError } = await supabase
            .from('user_access')
            .insert({
              email: email,
              stripe_customer_id: customerId,
              status: 'trialing'
            });

          if (insertError) {
            console.error('Error creating new user:', insertError);
          } else {
            console.log('Created new user with trialing status:', email);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.customer) {
          console.error('Missing customer in invoice');
          break;
        }

        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer.id;

        console.log('Processing successful payment for customer:', customerId);

        const { error } = await supabase
          .from('user_access')
          .update({ status: 'active' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating user to active:', error);
        } else {
          console.log('Updated user to active status for customer:', customerId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.customer) {
          console.error('Missing customer in invoice');
          break;
        }

        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer.id;

        console.log('Processing failed payment for customer:', customerId);

        const { error } = await supabase
          .from('user_access')
          .update({ status: 'inactive' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating user to inactive:', error);
        } else {
          console.log('Updated user to inactive status for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        if (!subscription.customer) {
          console.error('Missing customer in subscription');
          break;
        }

        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        console.log('Processing subscription cancellation for customer:', customerId);

        const { error } = await supabase
          .from('user_access')
          .update({ status: 'inactive' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating user to inactive:', error);
        } else {
          console.log('Updated user to inactive status for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        
        if (!subscription.customer) {
          console.error('Missing customer in subscription trial_will_end');
          break;
        }

        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        console.log('Trial ending soon for customer:', customerId);
        // Note: Keep status as 'trialing' until trial actually ends
        // This event is just a warning that trial will end soon
        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // If this is the first invoice after trial and it's not paid automatically,
        // the subscription will move to past_due and eventually be cancelled
        if (!invoice.customer) {
          console.error('Missing customer in invoice.created');
          break;
        }

        console.log('Invoice created for customer:', invoice.customer);
        // No status change needed here - wait for payment_succeeded or payment_failed
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response('OK', { 
      status: 200, 
      headers: responseHeaders 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: responseHeaders 
    });
  }
}, {
  allowedMethods: ['POST', 'OPTIONS'],
  rateLimiter: webhooksLimiter,
  requireValidOrigin: false // Webhooks come from Stripe, not our domain
});

Deno.serve(secureHandler); 