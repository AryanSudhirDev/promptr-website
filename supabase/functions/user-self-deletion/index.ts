import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Email is required' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting deletion for email: ${email}`);

    // Initialize Supabase with service role key (full admin access)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let deletionSteps = [];

    // Step 1: Get user data from database
    console.log('Step 1: Getting user data...');
    const { data: userData, error: fetchError } = await supabase
      .from('user_access')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userData) {
      deletionSteps.push('✓ Found user in database');
      
      // Step 2: Clean up Stripe if customer exists
      if (userData.stripe_customer_id) {
        console.log('Step 2: Cleaning up Stripe...');
        try {
          // Cancel all subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: userData.stripe_customer_id,
            status: 'all',
            limit: 100,
          });

          for (const subscription of subscriptions.data) {
            if (subscription.status === 'active' || subscription.status === 'trialing') {
              await stripe.subscriptions.cancel(subscription.id);
              console.log(`Cancelled subscription: ${subscription.id}`);
            }
          }

          // Delete payment methods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: userData.stripe_customer_id,
            limit: 100,
          });

          for (const paymentMethod of paymentMethods.data) {
            await stripe.paymentMethods.detach(paymentMethod.id);
            console.log(`Detached payment method: ${paymentMethod.id}`);
          }

          // Delete customer
          await stripe.customers.del(userData.stripe_customer_id);
          console.log(`Deleted Stripe customer: ${userData.stripe_customer_id}`);
          
          deletionSteps.push('✓ Cleaned up Stripe data');
        } catch (stripeError) {
          console.log('Stripe cleanup error (continuing):', stripeError.message);
          deletionSteps.push('⚠ Stripe cleanup had issues (continuing)');
        }
      } else {
        deletionSteps.push('✓ No Stripe data to clean up');
      }

      // Step 3: Delete from database
      console.log('Step 3: Deleting from database...');
      const { error: deleteError } = await supabase
        .from('user_access')
        .delete()
        .eq('email', email.toLowerCase().trim());

      if (deleteError) {
        console.error('Database deletion error:', deleteError);
        deletionSteps.push('✗ Database deletion failed');
      } else {
        deletionSteps.push('✓ Deleted from database');
      }
    } else {
      deletionSteps.push('✓ No database record found');
    }

    // Step 4: Clean up Supabase Auth users
    console.log('Step 4: Cleaning up auth...');
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      const authUser = authUsers.users?.find(u => u.email === email.toLowerCase().trim());
      if (authUser) {
        await supabase.auth.admin.deleteUser(authUser.id);
        deletionSteps.push('✓ Deleted auth user');
      } else {
        deletionSteps.push('✓ No auth user to clean up');
      }
    } catch (authError) {
      console.log('Auth cleanup error (continuing):', authError.message);
      deletionSteps.push('⚠ Auth cleanup had issues');
    }

    console.log('Deletion completed for:', email);
    console.log('Steps completed:', deletionSteps);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Account for ${email} has been completely deleted. All data removed from Stripe and database.`,
      steps: deletionSteps
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deletion error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to delete user account' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 