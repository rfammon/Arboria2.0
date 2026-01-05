import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables'); // Hope this exists

    if (error) {
        // Alternative using information_schema via query if rpc doesn't exist
        // But usually we can't do raw SQL via supabase-js without an RPC
        console.error('RPC Error:', error);

        // Try a simple select from common tables to see which ones fail
        const tables = ['user_device_tokens', 'device_tokens', 'user_notification_preferences', 'notifications'];
        for (const t of tables) {
            const { error: e } = await supabase.from(t).select('count', { count: 'exact', head: true });
            console.log(`Table ${t}: ${e ? '❌ Not Found (' + e.message + ')' : '✅ OK'}`);
        }
        return;
    }
    console.log(data);
}

listTables();
