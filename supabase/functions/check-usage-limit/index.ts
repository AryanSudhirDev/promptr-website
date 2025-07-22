import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user by token
    const { data: user, error: userError } = await supabase
      .from('user_access')
      .select('id, plan_type, stripe_product_id')
      .eq('access_token', token)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If user has pro plan, allow unlimited requests
    if (user.plan_type === 'pro') {
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          plan: 'pro', 
          message: 'Unlimited requests' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For free plan, check usage
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Get or create usage record for current month
    let { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('token_id', user.id)
      .eq('month_start', monthStart.toISOString().split('T')[0])
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Failed to check usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create usage record if it doesn't exist
    if (!usage) {
      const { data: newUsage, error: createError } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          token_id: user.id,
          month_start: monthStart.toISOString().split('T')[0],
          request_count: 0
        })
        .select()
        .single()

      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create usage record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      usage = newUsage
    }

    // Check if limit reached
    if (usage.request_count >= 50) {
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          plan: 'free', 
          current_usage: usage.request_count,
          limit: 50,
          message: 'Free plan limit reached (50 prompt refinements/month). Upgrade to Pro for unlimited requests.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({ request_count: usage.request_count + 1 })
      .eq('id', usage.id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        plan: 'free', 
        current_usage: usage.request_count + 1,
        limit: 50,
        message: 'Request allowed' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 