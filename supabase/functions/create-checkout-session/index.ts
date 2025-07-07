import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      customer_email: email,
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID') || '', quantity: 1 }],
      success_url: 'https://your-site.com/after-checkout?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://your-site.com/cancelled',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout-session error', err);
    return new Response('Internal error', { status: 500, headers: corsHeaders });
  }
});
