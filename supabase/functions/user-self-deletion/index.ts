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

interface DeletionStatus {
  success: boolean;
  email: string;
  steps: {
    userLookup: { success: boolean; message: string; };
    stripeCleanup: { success: boolean; message: string; details?: any; };
    databaseCleanup: { success: boolean; message: string; };
    authCleanup: { success: boolean; message: string; };
  };
  summary: string;
  errors: string[];
}

console.log(`Function "user-self-deletion" up and running!`)

// Helper function to safely delete Stripe customer and all associated data
async function deleteStripeCustomer(stripe: Stripe, customerId: string): Promise<{ success: boolean; message: string; details?: any }> {
  const details = {
    subscriptionsCancelled: 0,
    paymentMethodsDeleted: 0,
    customerDeleted: false,
    errors: [] as string[]
  };

  try {
    console.log(`Starting comprehensive Stripe cleanup for customer: ${customerId}`);

    // Step 1: Cancel all subscriptions
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 100,
      });

      for (const subscription of subscriptions.data) {
        if (subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'past_due') {
          try {
            await stripe.subscriptions.cancel(subscription.id);
            details.subscriptionsCancelled++;
            console.log(`Cancelled subscription: ${subscription.id}`);
          } catch (subError) {
            const errorMsg = `Failed to cancel subscription ${subscription.id}: ${subError.message}`;
            details.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    } catch (subscriptionError) {
      const errorMsg = `Failed to list subscriptions: ${subscriptionError.message}`;
      details.errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Step 2: Delete all payment methods
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        limit: 100,
      });

      for (const paymentMethod of paymentMethods.data) {
        try {
          await stripe.paymentMethods.detach(paymentMethod.id);
          details.paymentMethodsDeleted++;
          console.log(`Detached payment method: ${paymentMethod.id}`);
        } catch (pmError) {
          const errorMsg = `Failed to detach payment method ${paymentMethod.id}: ${pmError.message}`;
          details.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    } catch (paymentMethodError) {
      const errorMsg = `Failed to list payment methods: ${paymentMethodError.message}`;
      details.errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Step 3: Delete the customer record
    try {
      await stripe.customers.del(customerId);
      details.customerDeleted = true;
      console.log(`Deleted Stripe customer: ${customerId}`);
    } catch (customerError) {
      const errorMsg = `Failed to delete customer: ${customerError.message}`;
      details.errors.push(errorMsg);
      console.error(errorMsg);
    }

    const success = details.customerDeleted && details.errors.length === 0;
    const message = success 
      ? `Stripe cleanup completed: ${details.subscriptionsCancelled} subscriptions cancelled, ${details.paymentMethodsDeleted} payment methods removed, customer deleted`
      : `Stripe cleanup partially completed with ${details.errors.length} errors`;

    return { success, message, details };

  } catch (error) {
    const errorMsg = `Stripe cleanup failed: ${error.message}`;
    details.errors.push(errorMsg);
    console.error(errorMsg);
    return { success: false, message: errorMsg, details };
  }
}

// Secure handler using the security middleware
const secureHandler = withSecurity(async (req: Request) => {
  const responseHeaders = getResponseHeaders(req);
  
  const status: DeletionStatus = {
    success: false,
    email: '',
    steps: {
      userLookup: { success: false, message: '' },
      stripeCleanup: { success: false, message: '' },
      databaseCleanup: { success: false, message: '' },
      authCleanup: { success: false, message: '' }
    },
    summary: '',
    errors: []
  };

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

    const email = requestData.email.toLowerCase().trim();
    status.email = email;
    console.log(`Starting bulletproof deletion for email: ${email}`);

    // Initialize Supabase and Stripe with service role key
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // PHASE 1: User Lookup and Validation
    console.log('PHASE 1: User lookup and validation...');
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('user_access')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        status.steps.userLookup = { 
          success: false, 
          message: `Database error: ${fetchError.message}` 
        };
        status.errors.push(status.steps.userLookup.message);
      } else if (!userData) {
        status.steps.userLookup = { 
          success: true, 
          message: 'User not found in database (may have been already deleted)' 
        };
      } else {
        status.steps.userLookup = { 
          success: true, 
          message: `User found with status: ${userData.status}${userData.stripe_customer_id ? ', has Stripe customer' : ', no Stripe customer'}` 
        };
      }

      // PHASE 2: Stripe Cleanup (if customer exists)
      console.log('PHASE 2: Stripe cleanup...');
      if (userData?.stripe_customer_id) {
        console.log(`User has Stripe customer ID: ${userData.stripe_customer_id}, performing comprehensive cleanup...`);
        
        try {
          // Verify customer exists in Stripe first
          await stripe.customers.retrieve(userData.stripe_customer_id);
          
          const stripeResult = await deleteStripeCustomer(stripe, userData.stripe_customer_id);
          status.steps.stripeCleanup = stripeResult;
          
          if (!stripeResult.success) {
            status.errors.push(`Stripe cleanup issues: ${stripeResult.message}`);
          }
        } catch (stripeError) {
          if (stripeError.code === 'resource_missing') {
            status.steps.stripeCleanup = { 
              success: true, 
              message: 'Stripe customer already deleted or never existed' 
            };
          } else {
            status.steps.stripeCleanup = { 
              success: false, 
              message: `Stripe customer verification failed: ${stripeError.message}` 
            };
            status.errors.push(status.steps.stripeCleanup.message);
          }
        }
      } else {
        status.steps.stripeCleanup = { 
          success: true, 
          message: 'No Stripe customer to clean up' 
        };
      }

      // PHASE 3: Database Cleanup (only if Stripe cleanup succeeded or wasn't needed)
      console.log('PHASE 3: Database cleanup...');
      if (userData && (status.steps.stripeCleanup.success || !userData.stripe_customer_id)) {
        try {
          const { error: deleteError } = await supabase
            .from('user_access')
            .delete()
            .eq('email', email);

          if (deleteError) {
            status.steps.databaseCleanup = { 
              success: false, 
              message: `Failed to delete user data: ${deleteError.message}` 
            };
            status.errors.push(status.steps.databaseCleanup.message);
          } else {
            status.steps.databaseCleanup = { 
              success: true, 
              message: 'User data deleted from database' 
            };
          }
        } catch (dbError) {
          status.steps.databaseCleanup = { 
            success: false, 
            message: `Database deletion error: ${dbError.message}` 
          };
          status.errors.push(status.steps.databaseCleanup.message);
        }
      } else if (userData && !status.steps.stripeCleanup.success) {
        status.steps.databaseCleanup = { 
          success: false, 
          message: 'Skipped database cleanup due to Stripe cleanup failure' 
        };
        status.errors.push('Database cleanup was skipped because Stripe cleanup failed');
      } else {
        status.steps.databaseCleanup = { 
          success: true, 
          message: 'No database records to clean up' 
        };
      }

      // PHASE 4: Supabase Auth Cleanup
      console.log('PHASE 4: Supabase Auth cleanup...');
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        });

        const authUser = authUsers.users?.find(u => u.email === email);
        
        if (authUser) {
          const { error: deletion_error } = await supabase.auth.admin.deleteUser(authUser.id);

          if (deletion_error) {
            status.steps.authCleanup = { 
              success: false, 
              message: `Failed to delete auth user: ${deletion_error.message}` 
            };
            status.errors.push(status.steps.authCleanup.message);
          } else {
            status.steps.authCleanup = { 
              success: true, 
              message: 'Supabase auth user deleted' 
            };
          }
        } else {
          status.steps.authCleanup = { 
            success: true, 
            message: 'No Supabase auth user to clean up' 
          };
        }
      } catch (authError) {
        status.steps.authCleanup = { 
          success: false, 
          message: `Auth cleanup error: ${authError.message}` 
        };
        status.errors.push(status.steps.authCleanup.message);
      }

    } catch (phaseError) {
      status.errors.push(`Processing error: ${phaseError.message}`);
      console.error('Phase processing error:', phaseError);
    }

    // Determine overall success
    const criticalStepsSucceeded = status.steps.userLookup.success && 
                                  status.steps.stripeCleanup.success && 
                                  status.steps.databaseCleanup.success;
    
    status.success = criticalStepsSucceeded && status.errors.length === 0;

    // Generate summary
    if (status.success) {
      status.summary = `Account for ${email} has been completely deleted. All data removed from Stripe and database.`;
    } else if (criticalStepsSucceeded) {
      status.summary = `Account for ${email} has been mostly deleted, but with ${status.errors.length} minor issues.`;
    } else {
      status.summary = `Account deletion for ${email} failed. ${status.errors.length} errors occurred.`;
    }

    console.log('Deletion process completed:', status);

    return new Response(
      JSON.stringify({ 
        success: status.success,
        message: status.summary,
        email: email,
        details: status,
        // For backwards compatibility with existing UI
        deletedSubscriptions: status.steps.stripeCleanup.success
      }), 
      {
        headers: responseHeaders,
        status: status.success ? 200 : (criticalStepsSucceeded ? 206 : 500),
      }
    );

  } catch (error) {
    console.error('User deletion error:', error);
    status.errors.push(`Unexpected error: ${error.message}`);
    status.summary = `Account deletion failed due to unexpected error: ${error.message}`;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete user account',
        message: status.summary,
        details: status
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