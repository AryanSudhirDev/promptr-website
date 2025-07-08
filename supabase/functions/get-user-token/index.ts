import { createClient } from 'npm:@supabase/supabase-js@2';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { apiGeneralLimiter } from '../_shared/rate-limiter.ts';

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
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing email' 
      }), { 
        status: 400, 
        headers: responseHeaders
      });
    }

    // Initialize Supabase client with service role key
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
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No access token found for this email. Please complete your purchase first.' 
      }), { 
        status: 404, 
        headers: responseHeaders
      });
    }

    // Return token and status
    return new Response(JSON.stringify({
      success: true,
      token: user.access_token,
      status: user.status
    }), { 
      status: 200, 
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Get token error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), { 
      status: 500, 
      headers: responseHeaders
    });
  }
}, {
  allowedMethods: ['POST', 'OPTIONS'],
  rateLimiter: apiGeneralLimiter,
  requireValidOrigin: false
});

Deno.serve(secureHandler); 