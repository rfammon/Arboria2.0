import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function mapUsers() {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Erro ao listar usuários:', error);
        return;
    }

    console.table(users.users.map(u => ({
        id: u.id,
        email: u.email,
        last_sign_in: u.last_sign_in_at
    })));
}

mapUsers();
