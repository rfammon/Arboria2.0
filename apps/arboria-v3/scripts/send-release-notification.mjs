import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function broadcastReleaseNotification() {
    console.log('🚀 Iniciando broadcast de notificação para v1.1.21...');

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        return;
    }

    const releaseTitle = 'Atualização v1.1.21 - Correção TRAQ';
    const releaseMessage = 'Agora os fatores agravantes (Q6, Q9, Q10, Q11, Q12, Q14, Q15) não exigem probabilidade de falha e aparecem corretamente no resumo.';
    const actionLink = '/settings';

    for (const user of users) {
        const { error: notifyError } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type: 'SUCCESS',
                title: releaseTitle,
                message: releaseMessage,
                action_link: actionLink,
                metadata: { version: '1.1.21', is_release: true }
            });

        if (notifyError) console.error(`❌ Falha para ${user.email}:`, notifyError);
        else console.log(`✅ Notificado: ${user.email}`);
    }
    console.log('✨ Broadcast v1.1.21 concluído!');
}

broadcastReleaseNotification();
