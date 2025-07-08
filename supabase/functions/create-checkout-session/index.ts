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

  // Quick test endpoint - add ?test=1 to just check environment
  const url = new URL(req.url);
  if (url.searchParams.get('test') === '1') {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const siteUrl = Deno.env.get('SITE_URL');
    
    return new Response(JSON.stringify({
      test: true,
      environment: {
        STRIPE_SECRET_KEY: stripeSecretKey ? `${stripeSecretKey.substring(0, 8)}...` : 'MISSING',
        STRIPE_PRICE_ID: stripePriceId || 'MISSING',
        SUPABASE_URL: supabaseUrl || 'MISSING',
        SITE_URL: siteUrl || 'MISSING'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Comprehensive diagnostic test - add ?debug=1
  if (url.searchParams.get('debug') === '1') {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        STRIPE_SECRET_KEY: stripeSecretKey ? `${stripeSecretKey.substring(0, 8)}...` : 'MISSING',
        STRIPE_PRICE_ID: stripePriceId || 'MISSING',
        key_type: stripeSecretKey ? (stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : stripeSecretKey.startsWith('sk_test_') ? 'TEST' : 'UNKNOWN') : 'MISSING'
      },
      tests: {}
    };

    // Test 1: Basic Stripe connection
    try {
      if (stripeSecretKey) {
        const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
        const account = await stripe.accounts.retrieve();
        diagnostics.tests.stripe_connection = {
          status: 'SUCCESS',
          account_id: account.id,
          mode: account.details_submitted ? 'live' : 'test'
        };

        // Test 2: Price validation
        if (stripePriceId) {
          try {
            const price = await stripe.prices.retrieve(stripePriceId);
            diagnostics.tests.price_validation = {
              status: 'SUCCESS',
              price_id: price.id,
              amount: price.unit_amount,
              currency: price.currency,
              type: price.type,
              recurring: price.recurring
            };
          } catch (priceError) {
            diagnostics.tests.price_validation = {
              status: 'FAILED',
              error: priceError.message,
              price_id: stripePriceId
            };
          }
        } else {
          diagnostics.tests.price_validation = {
            status: 'SKIPPED',
            reason: 'No STRIPE_PRICE_ID'
          };
        }

        // Test 3: Try to create a minimal checkout session
        try {
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency: 'usd', unit_amount: 499, product_data: { name: 'Test Product' } }, quantity: 1 }],
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel',
          });
          diagnostics.tests.checkout_creation = {
            status: 'SUCCESS',
            session_id: session.id
          };
        } catch (checkoutError) {
          diagnostics.tests.checkout_creation = {
            status: 'FAILED',
            error: checkoutError.message
          };
        }

      } else {
        diagnostics.tests.stripe_connection = {
          status: 'SKIPPED',
          reason: 'No STRIPE_SECRET_KEY'
        };
      }
    } catch (error) {
      diagnostics.tests.stripe_connection = {
        status: 'FAILED',
        error: error.message
      };
    }

    return new Response(JSON.stringify(diagnostics, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

    // Debug environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const siteUrl = Deno.env.get('SITE_URL');
    
    console.log('Environment check:');
    console.log('- STRIPE_SECRET_KEY:', stripeSecretKey ? `${stripeSecretKey.substring(0, 8)}...` : 'MISSING');
    console.log('- STRIPE_PRICE_ID:', stripePriceId || 'MISSING');
    console.log('- SUPABASE_URL:', supabaseUrl || 'MISSING');
    console.log('- SITE_URL:', siteUrl || 'MISSING');

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is missing');
    }

    if (!stripePriceId) {
      throw new Error('STRIPE_PRICE_ID environment variable is missing');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get base URL from environment or request origin
    const baseUrl = siteUrl || req.headers.get('origin') || 'http://localhost:5173';
    
    console.log('Creating Stripe checkout session with:');
    console.log('- Email:', email);
    console.log('- Price ID:', stripePriceId);
    console.log('- Base URL:', baseUrl);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${baseUrl}/?payment=success`,
      cancel_url: `${baseUrl}/cancelled`,
    });

    console.log('Stripe session created successfully:', session.id);
    console.log('Redirect URL:', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout-session error', err);
    
    // More detailed error handling for debugging
    let errorMessage = 'Something went wrong. Please try again.';
    let errorDetails = '';
    
    if (err instanceof Error) {
      errorDetails = err.message;
      console.log('Full error details:', err);
      
      // Check for specific Stripe errors
      if (err.message.includes('price') || err.message.includes('Price')) {
        errorMessage = 'Invalid price configuration. Please contact support.';
      } else if (err.message.includes('secret') || err.message.includes('key')) {
        errorMessage = 'Stripe configuration error. Please contact support.';
      } else if (err.message.includes('customer')) {
        errorMessage = 'Customer creation error. Please try again.';
      } else if (err.message.includes('STRIPE_SECRET_KEY')) {
        errorMessage = 'Stripe secret key is missing. Please contact support.';
      } else if (err.message.includes('STRIPE_PRICE_ID')) {
        errorMessage = 'Stripe price ID is missing. Please contact support.';
      }
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: errorMessage,
      debug: `Debug: ${errorDetails}`,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 