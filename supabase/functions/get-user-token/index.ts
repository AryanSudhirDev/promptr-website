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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Debug endpoint to check database
    const url = new URL(req.url);
    if (url.searchParams.has('debug')) {
      const supabase = createClient<Database>(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      const { data: allUsers, error } = await supabase
        .from('user_access')
        .select('email, access_token, stripe_customer_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        success: true,
        debug: true,
        users: allUsers,
        error: error?.message,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing email' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Look up user by email
    const { data: user, error } = await supabase
      .from('user_access')
      .select('access_token, status')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      // Check if this is a missing user scenario (user authenticated via Clerk but not in database)
      // This can happen if webhook failed during payment or user signed up but never paid
      
      // For now, return the standard error message
      // Later we could add automatic user creation here for authenticated users
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No access token found for this email. Please complete your purchase first.',
        suggestion: 'If you recently completed payment, please try again in a few minutes or contact support.'
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return token and status
    return new Response(JSON.stringify({
      success: true,
      token: user.access_token,
      status: user.status
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 