import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { apiGeneralLimiter } from '../_shared/rate-limiter.ts';

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

// Secure handler using the security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing email' }), { 
        status: 400, 
        headers: responseHeaders
      });
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
        headers: responseHeaders,
      });
    }



    // Initialize Supabase client to check existing subscriptions
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Check if user already has a subscription
    const { data: existingUser, error: userError } = await supabase
      .from('user_access')
      .select('status, stripe_customer_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    // If user exists and has active or trialing subscription, prevent checkout
    if (existingUser && !userError) {
      if (existingUser.status === 'active' || existingUser.status === 'trialing') {
        return new Response(JSON.stringify({ 
          error: 'You already have an active subscription',
          message: 'You already have an active Promptr Pro subscription. Visit your account dashboard to manage it.',
          redirect: '/account',
          hasActiveSubscription: true
        }), {
          status: 400,
          headers: responseHeaders,
        });
      }
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');
    const siteUrl = Deno.env.get('SITE_URL');

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

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: responseHeaders,
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
      headers: responseHeaders
    });
  }
}, {
  allowedMethods: ['POST', 'OPTIONS'],
  rateLimiter: apiGeneralLimiter,
  requireValidOrigin: false // Allow public access for payments
});

Deno.serve(secureHandler); 