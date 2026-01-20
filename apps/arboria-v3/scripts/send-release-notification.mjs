import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function broadcastReleaseNotification() {
    // Get version and info from package.json
    const packageJson = JSON.parse(await import('fs').then(fs => fs.readFileSync('./package.json', 'utf8')));
    const version = packageJson.version;

    console.log(`🚀 Iniciando broadcast de notificação para v${version}...`);

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        return;
    }

    const releaseTitle = `ArborIA v${version} - Cabeçalho Refinado`;
    const releaseMessage = 'Cabeçalho mobile otimizado: Marca ArborIA em destaque, sem sobreposições e com visual mais limpo e profissional.';
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
                metadata: { version: version, is_release: true, type: 'app_update' }
            });

        if (notifyError) console.error(`❌ Falha para ${user.email}:`, notifyError);
        else console.log(`✅ Notificado: ${user.email}`);
    }
    console.log(`✨ Broadcast v${version} concluído!`);
}

broadcastReleaseNotification();
