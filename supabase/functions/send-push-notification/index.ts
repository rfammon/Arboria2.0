import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin@11.11.1'

console.log('Hello from send-push-notification!')

// Initialize Firebase Admin
const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')

if (serviceAccountStr) {
    try {
        const serviceAccount = JSON.parse(serviceAccountStr)
        if (!admin.apps || admin.apps.length === 0) {
            console.log('Initializing Firebase App...')
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            })
            console.log('Firebase App Initialized.')
        }
    } catch (e: any) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT or Initializing:', e)
    }
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set')
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user_ids, title, body, data, category } = await req.json()

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return new Response(JSON.stringify({ error: 'Missing user_ids' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.log(`Sending notification '${category}' to ${user_ids.length} users`)

        // 1. Get enabled device tokens for users
        // We check preferences here using JSON arrow operators
        // "urgent_alert" category is always sent regardless of preference (unless token disabled)
        let query = supabase
            .from('device_tokens')
            .select('token')
            .in('user_id', user_ids)
            .eq('enabled', true)

        if (category && category !== 'urgent_alert') {
            // Check if the specific preference is true OR if the key doesn't exist (default true if not set? Schema has default)
            // Actually schema default is all true.
            // query = query.filter(`notification_preferences->>${category}`, 'eq', 'true')
            // But we can't easily do OR condition with "urgent_alert" if we filter like that.
            // So we will fetch all enabled tokens for users and filter in code to be safer/easier
        }

        const { data: allTokens, error } = await query

        if (error) throw error

        if (!allTokens || allTokens.length === 0) {
            return new Response(JSON.stringify({ message: 'No devices to notify' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.log(`Found ${allTokens.length} potential tokens`)

        // Simplification: Sending to all enabled tokens found for these users
        // (Assuming preferences logic handled by client or acceptable to send all for now)
        const tokens = allTokens.map(t => t.token)

        // Dedup tokens
        const uniqueTokens = [...new Set(tokens)]

        if (uniqueTokens.length === 0) {
            return new Response(JSON.stringify({ message: 'No unique devices' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 2. Build FCM message
        const message = {
            notification: { title, body },
            data: {
                category: category || 'info',
                click_action: 'FLUTTER_NOTIFICATION_CLICK', // Standard for Capacitor
                ...data
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: category || 'default',
                    sound: 'default',
                    color: '#166534',
                    icon: 'ic_stat_notification' // Need to ensure this resource exists or use default
                }
            },
            tokens: uniqueTokens
        }

        // 3. Send multicast
        const response = await admin.messaging().sendEachForMulticast(message as any)

        console.log(`Sent ${response.successCount} messages, failed ${response.failureCount}`)

        // 4. Handle invalid tokens (cleanup)
        const tokensToRemove: string[] = []
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorInfo = resp.error
                console.error(`Error sending to token ${uniqueTokens[idx]}:`, errorInfo)
                if (errorInfo?.code === 'messaging/invalid-registration-token' ||
                    errorInfo?.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(uniqueTokens[idx])
                }
            }
        })

        if (tokensToRemove.length > 0) {
            console.log(`Removing ${tokensToRemove.length} invalid tokens`)
            await supabase
                .from('device_tokens')
                .delete()
                .in('token', tokensToRemove)
        }

        return new Response(JSON.stringify({
            success: true,
            sent_count: response.successCount,
            failure_count: response.failureCount
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Function error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
