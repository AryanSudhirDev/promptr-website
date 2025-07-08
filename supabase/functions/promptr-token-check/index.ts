import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface PromptTokenResponse {
  valid: boolean;
  status?: 'trialing' | 'active' | 'inactive';
  email?: string;
  message?: string;
  expires_at?: string | null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    let promptr_token: string;

    if (req.method === 'POST') {
      // POST method: token in body
      const body = await req.json();
      promptr_token = body.promptr_token;
    } else if (req.method === 'GET') {
      // GET method: token in query parameter  
      const url = new URL(req.url);
      promptr_token = url.searchParams.get('promptr_token') || '';
    } else {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Method not allowed' 
      }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!promptr_token) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Missing promptr_token' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Promptr token validation request for: ${promptr_token.substring(0, 8)}...`);

    // Look up token in user_access table
    const { data: user, error } = await supabase
      .from('user_access')
      .select('email, status, created_at, updated_at')
      .eq('access_token', promptr_token)
      .single();

    if (error || !user) {
      console.log('Promptr token not found:', promptr_token.substring(0, 8));
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Invalid promptr token' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if subscription is active
    const isValidStatus = user.status === 'active' || user.status === 'trialing';
    
    if (!isValidStatus) {
      console.log(`Promptr token found but subscription inactive: ${user.email}, status: ${user.status}`);
      return new Response(JSON.stringify({ 
        valid: false,
        status: user.status,
        email: user.email,
        message: `Subscription is ${user.status}. Please update your payment method.`
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Token is valid and subscription is active
    console.log(`Promptr token validation successful: ${user.email}, status: ${user.status}`);

    const response: PromptTokenResponse = {
      valid: true,
      status: user.status,
      email: user.email,
      message: `Access granted for ${user.status} subscription`,
      expires_at: null // Tokens don't expire, subscriptions do
    };

    return new Response(JSON.stringify(response), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Promptr token validation error:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      message: 'Internal server error' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 