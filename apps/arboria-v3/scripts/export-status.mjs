import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportStatus() {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const { data: prefs } = await supabase.from('user_notification_preferences').select('*');
    const { data: tokens } = await supabase.from('user_device_tokens').select('*');
    const { data: devTokens } = await supabase.from('device_tokens').select('*');

    const result = {
        users: users.map(u => ({ id: u.id, email: u.email })),
        preferences: prefs,
        user_device_tokens: tokens,
        device_tokens: devTokens
    };

    console.log(JSON.stringify(result, null, 2));
}

exportStatus();
