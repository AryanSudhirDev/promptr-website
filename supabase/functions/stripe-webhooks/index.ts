import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

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
        headers: corsHeaders 
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
        headers: corsHeaders 
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

        console.log('Processing subscription deletion for customer:', customerId);

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

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});