import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function broadcastReleaseNotification() {
    console.log('🚀 Iniciando broadcast AMPLIFICADO de notificação para v1.1.14...');

    // 1. Buscar TODOS os usuários do sistema via Auth API (Admin)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        return;
    }

    console.log(`📢 Encontrados ${users.length} usuários totais.`);

    const releaseTitle = 'Nova Versão Disponível: v1.1.14';
    const releaseMessage = 'ArborIA v1.1.14 disponível! Inclui correções críticas na recaptura de GPS para melhor precisão em campo.';
    const actionLink = '/settings';

    for (const user of users) {
        console.log(`🔔 Notificando usuário: ${user.email} (${user.id})`);

        // 2. Criar a notificação na tabela (isso aparece na Central de Notificações In-App)
        const { error: notifyError } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type: 'SUCCESS',
                title: releaseTitle,
                message: releaseMessage,
                action_link: actionLink,
                metadata: {
                    version: '1.1.14',
                    is_release: true
                }
            });

        if (notifyError) {
            console.error(`❌ Falha ao inserir notificação para ${user.email}:`, notifyError);
        } else {
            console.log(`✅ Registro de notificação criado para ${user.email}`);
        }
    }

    console.log('✨ Broadcast amplificado concluído!');
}

broadcastReleaseNotification();
