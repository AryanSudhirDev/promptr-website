import { createClient } from 'npm:@supabase/supabase-js@2';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { authOperationsLimiter } from '../_shared/rate-limiter.ts';
import { InputValidator, createValidationErrorResponse } from '../_shared/validation.ts';

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

// Secure handler using the new security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  try {
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
          headers: responseHeaders
        }
      );
    }

    // Validate request body structure
    const bodyValidation = InputValidator.validateRequestBody(requestData, ['email']);
    if (!bodyValidation.isValid) {
      return createValidationErrorResponse(bodyValidation.errors, responseHeaders);
    }

    // Validate email
    const emailValidation = InputValidator.validateEmail(requestData.email);
    if (!emailValidation.isValid) {
      return createValidationErrorResponse(emailValidation.errors, responseHeaders);
    }

    const email = emailValidation.sanitized;

    // Look up user by email
    const { data: user, error } = await supabase
      .from('user_access')
      .select('access_token, status')
      .eq('email', email)
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
            headers: responseHeaders
          }
        );
      } else {
        // Database error
        console.error('Database error during user lookup:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Internal server error' }), 
          { 
            status: 500, 
            headers: responseHeaders
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
        headers: responseHeaders
      }
    );

  } catch (error) {
    // Log error without sensitive information
    console.error('Get token error:', {
      message: error.message,
      stack: error.stack?.split('\n')[0] // Only first line of stack
    });
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }), 
      { 
        status: 500, 
        headers: responseHeaders
      }
    );
  }
}, {
  rateLimiter: authOperationsLimiter,
  requireValidOrigin: false
});

// Export the secure handler
Deno.serve(secureHandler); 