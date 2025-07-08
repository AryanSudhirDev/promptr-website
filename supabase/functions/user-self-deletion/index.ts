import { serve } from 'https://deno.land/std@0.182.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'
import Stripe from 'npm:stripe@14'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "user-self-deletion" up and running!`)

serve(async (req: Request) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      // This way your row-level-security (RLS) policies are applied
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! } 
        } 
      }
    )

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('Authenticated user:', user.id, user.email)

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Try to get user data from our custom table
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('user_access')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (!fetchError && userData?.stripe_customer_id) {
      console.log('User has subscription data, cleaning up Stripe...')
      
      // Initialize Stripe for cleanup
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16',
      })

      try {
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: 'all',
          limit: 100,
        })

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await stripe.subscriptions.cancel(subscription.id)
            console.log('Cancelled subscription:', subscription.id)
          }
        }
      } catch (stripeError) {
        console.error('Stripe cleanup failed:', stripeError)
        // Continue with deletion even if Stripe fails
      }

      // Delete user data from our custom table
      const { error: deleteError } = await supabaseAdmin
        .from('user_access')
        .delete()
        .eq('email', user.email!)

      if (deleteError) {
        console.error('Failed to delete user data:', deleteError)
      } else {
        console.log('Deleted user data from user_access table')
      }
    }

    // Delete the user from Supabase Auth (this will cascade to related tables)
    const { data: deletion_data, error: deletion_error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deletion_error) {
      throw deletion_error
    }

    console.log('User & files deleted user_id:', user.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User account has been permanently deleted',
        user_id: user.id
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('User deletion error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete user account' 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 