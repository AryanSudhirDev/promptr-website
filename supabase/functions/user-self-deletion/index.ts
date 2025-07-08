import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';
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

console.log(`Function "user-self-deletion" up and running!`)

// Secure handler using the security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  try {
    // Parse request body
    let requestData: { email: string };
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

    if (!requestData.email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }), 
        { 
          status: 400, 
          headers: responseHeaders
        }
      );
    }

    const email = requestData.email;
    console.log('Processing deletion for email:', email);

    // Initialize Supabase and Stripe with service role key
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Try to get user data from our custom table
    const { data: userData, error: fetchError } = await supabase
      .from('user_access')
      .select('*')
      .eq('email', email)
      .single();

    let deletedSubscriptions = false;

    if (!fetchError && userData?.stripe_customer_id) {
      console.log('User has subscription data, cleaning up Stripe...');
      
      try {
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: 'all',
          limit: 100,
        });

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await stripe.subscriptions.cancel(subscription.id);
            console.log('Cancelled subscription:', subscription.id);
            deletedSubscriptions = true;
          }
        }
      } catch (stripeError) {
        console.error('Stripe cleanup failed:', stripeError);
        // Continue with deletion even if Stripe fails
      }

      // Delete user data from our custom table
      const { error: deleteError } = await supabase
        .from('user_access')
        .delete()
        .eq('email', email);

      if (deleteError) {
        console.error('Failed to delete user data:', deleteError);
      } else {
        console.log('Deleted user data from user_access table');
      }
    }

    // Try to find and delete the user from Supabase Auth by email
    const { data: authUsers } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    const authUser = authUsers.users?.find(u => u.email === email);
    
    if (authUser) {
      // Delete the user from Supabase Auth
      const { error: deletion_error } = await supabase.auth.admin.deleteUser(authUser.id);

      if (deletion_error) {
        console.error('Failed to delete auth user:', deletion_error);
      } else {
        console.log('Deleted auth user:', authUser.id);
      }
    }

    console.log('User deletion completed for:', email);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Account for ${email} has been permanently deleted${deletedSubscriptions ? ' and subscriptions cancelled' : ''}`,
        email: email
      }), 
      {
        headers: responseHeaders,
        status: 200,
      }
    );

  } catch (error) {
    console.error('User deletion error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete user account' 
      }), 
      {
        headers: responseHeaders,
        status: 500,
      }
    );
  }
}, {
  rateLimiter: apiGeneralLimiter,
  requireValidOrigin: false
});

// Export the secure handler
Deno.serve(secureHandler); 