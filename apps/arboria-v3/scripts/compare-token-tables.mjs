import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function compareTables() {
    console.log('📊 Comparando tabelas de tokens...');

    const { data: userTokens } = await supabase.from('user_device_tokens').select('*');
    console.log(`user_device_tokens: ${userTokens?.length || 0} registros`);

    const { data: devTokens } = await supabase.from('device_tokens').select('*');
    console.log(`device_tokens: ${devTokens?.length || 0} registros`);
    if (devTokens && devTokens.length > 0) {
        console.table(devTokens.map(t => ({
            id: t.id,
            user_id: t.user_id,
            token: t.token?.substring(0, 10) + '...',
            enabled: t.enabled
        })));
    }
}

compareTables();
