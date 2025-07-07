import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      };
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return new Response('Missing email', { status: 400, headers: corsHeaders });
  }

  // Initialize Supabase client to check existing subscriptions
  const supabase = createClient<Database>(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    // Check if user already has a subscription
    const { data: existingUser, error: userError } = await supabase
      .from('user_access')
      .select('status, stripe_customer_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    // If user exists and has active or trialing subscription, prevent checkout
    if (existingUser && !userError) {
      if (existingUser.status === 'active' || existingUser.status === 'trialing') {
        console.log('Blocked checkout attempt for existing active user:', email, 'Status:', existingUser.status);
        return new Response(JSON.stringify({ 
          error: 'You already have an active subscription',
          message: 'You already have an active Promptr Pro subscription. Visit your account dashboard to manage it.',
          redirect: '/account',
          hasActiveSubscription: true
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // User exists but is inactive - log for monitoring
      console.log('Allowing checkout for inactive user:', email, 'Status:', existingUser.status);
    } else {
      // New user or user doesn't exist - allow checkout
      console.log('Allowing checkout for new user:', email);
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get base URL from environment or request origin
    const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID') || '', quantity: 1 }],
      success_url: `${baseUrl}/?payment=success`,
      cancel_url: `${baseUrl}/cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout-session error', err);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 