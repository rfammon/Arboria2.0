import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const userId = '0458eee1-78bd-42c4-a71d-4c0ed28e6f99';

async function checkUserTokens() {
    console.log(`🔍 Buscando tokens para o usuário ${userId}...`);

    const { data: userTokens } = await supabase
        .from('user_device_tokens')
        .select('*')
        .eq('user_id', userId);

    console.log(`user_device_tokens: ${userTokens?.length || 0} registros`);

    const { data: devTokens } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', userId);

    console.log(`device_tokens: ${devTokens?.length || 0} registros`);

    if (devTokens && devTokens.length > 0) {
        console.log('Dados em device_tokens:', devTokens);
    }
}

checkUserTokens();
