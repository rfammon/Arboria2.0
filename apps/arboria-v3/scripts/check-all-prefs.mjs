import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllPrefs() {
    console.log('🔍 Gerando relatório de preferências de todos os usuários...');

    const { data: prefs, error } = await supabase
        .from('user_notification_preferences')
        .select('*');

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.table(prefs.map(p => ({
        user_id: p.user_id,
        push: p.push_enabled,
        app_update: p.push_app_update,
        email: p.email_enabled
    })));

    const { data: tokens, error: tokenError } = await supabase
        .from('user_device_tokens')
        .select('*');

    console.log(`Tokens encontrados: ${tokens?.length || 0}`);
    if (tokens && tokens.length > 0) {
        console.table(tokens);
    }
}

checkAllPrefs();
