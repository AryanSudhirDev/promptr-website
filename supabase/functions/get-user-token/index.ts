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

interface GetTokenRequest {
  email: string;
}

interface GetTokenResponse {
  success: boolean;
  token?: string;
  status?: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Parse request body
    let requestData: GetTokenRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request format' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email
    const { email } = requestData;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Valid email is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Look up user by email
    const { data: user, error } = await supabase
      .from('user_access')
      .select('access_token, status')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No user found
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No access token found for this email. Please complete your purchase first.' 
          }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        // Database error
        console.error('Database error during user lookup:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Internal server error' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Return token and status
    const response: GetTokenResponse = {
      success: true,
      token: user.access_token,
      status: user.status
    };

    return new Response(
      JSON.stringify(response), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get token error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});