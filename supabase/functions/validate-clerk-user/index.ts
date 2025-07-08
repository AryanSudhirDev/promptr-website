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

interface ValidateUserRequest {
  clerk_user_id?: string;
  email?: string;
}

interface ValidateUserResponse {
  access: boolean;
  status?: string;
  email?: string;
  message?: string;
  user_id?: string;
}

// Secure handler using the security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Parse request body
    let requestData: ValidateUserRequest;
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

    // Validate request - need either clerk_user_id or email
    const hasUserId = requestData.clerk_user_id && typeof requestData.clerk_user_id === 'string';
    const hasEmail = requestData.email && typeof requestData.email === 'string';
    
    if (!hasUserId && !hasEmail) {
      return new Response(
        JSON.stringify({ 
          access: false, 
          message: 'Either clerk_user_id or email is required' 
        }), 
        { 
          status: 400, 
          headers: responseHeaders
        }
      );
    }

    // Look up user by email (since that's what we store)
    const email = hasEmail ? requestData.email!.toLowerCase().trim() : null;
    const clerkUserId = hasUserId ? requestData.clerk_user_id! : null;

    let userQuery = supabase
      .from('user_access')
      .select('email, status, created_at, updated_at')
      .single();

    if (email) {
      userQuery = userQuery.eq('email', email);
    } else if (clerkUserId) {
      // For now, we'll need to get email from Clerk or store clerk_user_id in our table
      // This is a placeholder - you might want to add clerk_user_id to your user_access table
      return new Response(
        JSON.stringify({ 
          access: false, 
          message: 'Clerk user ID lookup not yet implemented. Please use email.' 
        }), 
        { 
          status: 400, 
          headers: responseHeaders
        }
      );
    }

    const { data: user, error } = await userQuery;

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found in database
        console.log('User validation failed: User not found', { email, clerkUserId });
        return new Response(
          JSON.stringify({ 
            access: false, 
            message: 'User not found. Please complete your purchase first.' 
          }), 
          { 
            status: 200, // Return 200 but access: false for security
            headers: responseHeaders
          }
        );
      } else {
        // Database error
        console.error('Database error during user validation:', {
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
      console.log('User validation failed: Invalid subscription status', {
        email: user.email,
        status: user.status
      });
      return new Response(
        JSON.stringify({ 
          access: false, 
          status: user.status,
          email: user.email,
          message: 'Subscription is not active. Please update your payment method.' 
        }), 
        { 
          status: 200, // Return 200 but access: false
          headers: responseHeaders
        }
      );
    }

    // User is valid and subscription is active
    console.log('User validation successful:', {
      email: user.email,
      status: user.status
    });

    const response: ValidateUserResponse = {
      access: true,
      status: user.status,
      email: user.email,
      user_id: clerkUserId
    };

    return new Response(
      JSON.stringify(response), 
      { 
        status: 200, 
        headers: responseHeaders
      }
    );

  } catch (error: any) {
    // Log error without sensitive information
    console.error('User validation error:', {
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