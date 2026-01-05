import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTokenUsers() {
    console.log('🔍 Listando usuários com tokens...');

    // Get all users from Auth (to map emails)
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const emailMap = Object.fromEntries(users.map(u => [u.id, u.email]));

    // Check user_device_tokens
    const { data: userTokens } = await supabase.from('user_device_tokens').select('user_id');
    const uids = [...new Set(userTokens?.map(t => t.user_id) || [])];

    console.log('\nUsuários em user_device_tokens:');
    uids.forEach(id => console.log(`- ${emailMap[id] || id}`));

    // Check device_tokens
    const { data: devTokens } = await supabase.from('device_tokens').select('user_id');
    const dids = [...new Set(devTokens?.map(t => t.user_id) || [])];

    console.log('\nUsuários em device_tokens:');
    dids.forEach(id => console.log(`- ${emailMap[id] || id}`));
}

listTokenUsers();
