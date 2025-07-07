import { createClient } from 'npm:@supabase/supabase-js@2';
import { withSecurity, getResponseHeaders } from '../_shared/security-config.ts';
import { tokenValidationLimiter } from '../_shared/rate-limiter.ts';
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

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  access: boolean;
  status?: string;
  email?: string;
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
    let requestData: ValidateTokenRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ access: false, message: 'Invalid request format' }), 
        { 
          status: 400, 
          headers: responseHeaders
        }
      );
    }

    // Validate request body structure
    const bodyValidation = InputValidator.validateRequestBody(requestData, ['token']);
    if (!bodyValidation.isValid) {
      return createValidationErrorResponse(bodyValidation.errors, responseHeaders);
    }

    // Validate token format
    const tokenValidation = InputValidator.validateToken(requestData.token);
    if (!tokenValidation.isValid) {
      return createValidationErrorResponse(tokenValidation.errors, responseHeaders);
    }

    const token = tokenValidation.sanitized;

    // Look up user by access token
    const { data: user, error } = await supabase
      .from('user_access')
      .select('email, status, created_at, updated_at')
      .eq('access_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Token not found
        console.log('Token validation failed: Token not found');
        return new Response(
          JSON.stringify({ 
            access: false, 
            message: 'Invalid token' 
          }), 
          { 
            status: 200, // Return 200 but access: false for security
            headers: responseHeaders
          }
        );
      } else {
        // Database error
        console.error('Database error during token validation:', {
          code: error.code,
          message: error.message
        });
        return new Response(
          JSON.stringify({ access: false, message: 'Internal server error' }), 
          { 
            status: 500, 
            headers: responseHeaders
          }
        );
      }
    }

    // Check subscription status
    const hasValidSubscription = user.status === 'active' || user.status === 'trialing';
    
    if (!hasValidSubscription) {
      console.log('Token validation failed: Invalid subscription status', {
        email: user.email,
        status: user.status
      });
      return new Response(
        JSON.stringify({ 
          access: false, 
          status: user.status,
          message: 'Subscription is not active' 
        }), 
        { 
          status: 200, // Return 200 but access: false
          headers: responseHeaders
        }
      );
    }

    // Token is valid and subscription is active
    console.log('Token validation successful:', {
      email: user.email,
      status: user.status
    });

    const response: ValidateTokenResponse = {
      access: true,
      status: user.status,
      email: user.email
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
    console.error('Token validation error:', {
      message: error.message,
      stack: error.stack?.split('\n')[0] // Only first line of stack
    });
    return new Response(
      JSON.stringify({ access: false, message: 'Internal server error' }), 
      { 
        status: 500, 
        headers: responseHeaders
      }
    );
  }
}, {
  rateLimiter: tokenValidationLimiter,
  requireValidOrigin: true
});

// Export the secure handler
Deno.serve(secureHandler); 