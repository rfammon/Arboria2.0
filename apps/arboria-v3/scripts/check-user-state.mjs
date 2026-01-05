import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const userId = '0458eee1-78bd-42c4-a71d-4c0ed28e6f99';

async function checkUserState() {
    console.log(`🔍 Checking state for user: ${userId}`);

    // 1. Check Preferences
    const { data: prefs, error: prefsError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    console.log('Preferences:', prefs || prefsError);

    // 2. Check Device Tokens
    const { data: tokens, error: tokensError } = await supabase
        .from('user_device_tokens')
        .select('*')
        .eq('user_id', userId);

    console.log('Device Tokens:', tokens || tokensError);

    // 3. Check Recent Notifications
    const { data: notes, error: notesError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('Recent Notifications:', notes || notesError);
}

checkUserState();
