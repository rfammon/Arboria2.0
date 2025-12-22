import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials provided by user
const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
    const email = 'rafa.elammon@gmail.com';
    const password = 'teste123';

    console.log(`Creating user ${email}...`);

    // SKIPPED: Deletion logic (handled via SQL manually)

    // 2. Create User with Admin API (auto-confirms email)
    console.log('Calling createUser...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            nome: 'Rafael Ammon'
        }
    });

    if (createError) {
        console.error('Error creating user:', createError);
        return;
    }

    console.log('User created successfully:', newUser.user.id);

    // 3. Create Profile (if trigger didn't catch it)
    const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
            id: newUser.user.id,
            nome: 'Rafael Ammon',
            matricula: 'TESTE-001'
        });

    if (profileError) console.error('Error creating profile:', profileError);
    else console.log('Profile created/updated.');

    // 4. Add to RPBC2 Installation as Executante
    // Get IDs
    const { data: inst } = await supabase.from('instalacoes').select('id').ilike('nome', '%RPBC2%').single();
    const { data: role } = await supabase.from('perfis').select('id').eq('nome', 'Executante').single();

    if (inst && role) {
        const { error: memberError } = await supabase
            .from('instalacao_membros')
            .upsert({
                instalacao_id: inst.id,
                user_id: newUser.user.id,
                perfis: [role.id],
                status: 'ativo',
                data_entrada: new Date().toISOString()
            }, { onConflict: 'instalacao_id,user_id' });

        if (memberError) console.error('Error adding to installation:', memberError);
        else console.log('Added to RPBC2 as Executante.');
    } else {
        console.error('Could not find Installation RPBC2 or Role Executante');
    }
}

createTestUser();
