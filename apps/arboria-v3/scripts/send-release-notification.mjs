import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function broadcastReleaseNotification() {
    console.log('🚀 Invocando broadcast de notificação para v1.1.14...');

    // 1. Buscar todos os usuários que possuem preferências de push habilitadas
    // ou simplesmente buscar todos da auth.users se a tabela de preferências for opcional
    const { data: prefs, error: prefsError } = await supabase
        .from('user_notification_preferences')
        .select('user_id')
        .eq('push_enabled', true)
        .eq('push_app_update', true);

    if (prefsError) {
        console.error('❌ Erro ao buscar preferências:', prefsError);
        return;
    }

    console.log(`📢 Encontrados ${prefs.length} usuários para notificar.`);

    const releaseTitle = 'Nova Versão Disponível: v1.1.14';
    const releaseMessage = 'ArborIA v1.1.14 disponível! Inclui correções críticas na recaptura de GPS para melhor precisão em campo.';

    for (const pref of prefs) {
        console.log(`🔔 Notificando usuário: ${pref.user_id}`);

        const { error: notifyError } = await supabase
            .from('notifications')
            .insert({
                user_id: pref.user_id,
                type: 'SUCCESS',
                title: releaseTitle,
                message: releaseMessage,
                action_link: 'https://github.com/rfammon/Arboria2.0/releases/tag/v1.1.13',
                metadata: {
                    version: '1.1.14',
                    is_release: true
                }
            });

        if (notifyError) {
            console.error(`❌ Falha ao notificar ${pref.user_id}:`, notifyError);
        } else {
            console.log(`✅ Notificação enviada para ${pref.user_id}`);
        }
    }

    console.log('✨ Broadcast concluído!');
}

broadcastReleaseNotification();
