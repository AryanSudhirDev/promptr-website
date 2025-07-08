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
      // Auto-create missing user records for authenticated users
      // This handles cases where webhook failed during payment/signup
      console.log(`User not found: ${email}, attempting auto-creation...`);
      
      try {
        // Generate new access token
        const accessToken = crypto.randomUUID();
        
        // Create user record with trialing status
        // Stripe customer ID will be added later by webhook or manual process
        const { data: newUser, error: createError } = await supabase
          .from('user_access')
          .insert({
            email: email.toLowerCase().trim(),
            access_token: accessToken,
            stripe_customer_id: null, // Will be populated by webhook when it works
            status: 'trialing' // Default to trialing for new auto-created users
          })
          .select('access_token, status')
          .single();

        if (createError) {
          console.error('Failed to auto-create user:', createError);
          
          // If auto-creation fails, return the original error message
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'No access token found for this email. Please complete your purchase first.',
            suggestion: 'If you recently completed payment, please try again in a few minutes or contact support.',
            debug: `Auto-creation failed: ${createError.message}`
          }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log(`Successfully auto-created user: ${email} with token: ${accessToken}`);
        
        // Return the newly created user's token
        return new Response(JSON.stringify({
          success: true,
          token: newUser.access_token,
          status: newUser.status,
          auto_created: true // Flag to indicate this was auto-created
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (autoCreateError) {
        console.error('Auto-creation exception:', autoCreateError);
        
        // Fall back to original error message
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'No access token found for this email. Please complete your purchase first.',
          suggestion: 'If you recently completed payment, please try again in a few minutes or contact support.'
        }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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