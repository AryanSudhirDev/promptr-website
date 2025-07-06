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

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  access: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ access: false }), 
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
    let requestData: ValidateTokenRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ access: false }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate token format (should be a valid UUID)
    const { token } = requestData;
    if (!token || typeof token !== 'string') {
      console.log('Missing or invalid token format');
      return new Response(
        JSON.stringify({ access: false }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      console.log('Invalid token format (not a UUID)');
      return new Response(
        JSON.stringify({ access: false }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Look up user by access token
    const { data: user, error } = await supabase
      .from('user_access')
      .select('status')
      .eq('access_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - token not found
        console.log('Token not found in database');
        return new Response(
          JSON.stringify({ access: false }), 
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        // Database error
        console.error('Database error during token lookup:', error);
        return new Response(
          JSON.stringify({ access: false }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Check if user has valid access (trialing or active status)
    const hasAccess = user.status === 'trialing' || user.status === 'active';
    
    console.log(`Token validation result: ${hasAccess ? 'granted' : 'denied'} (status: ${user.status})`);

    const response: ValidateTokenResponse = { access: hasAccess };

    return new Response(
      JSON.stringify(response), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Token validation error:', error);
    return new Response(
      JSON.stringify({ access: false }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});