import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need to ask user for this or check if I have it

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
    const email = 'rafa.elammon@gmail.com';
    const password = 'teste123';

    console.log(`Creating user ${email}...`);

    // 1. Check if user exists (and delete if so to start fresh)
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === email);

    if (existingUser) {
        console.log('User exists, deleting to recreate properly...');
        await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // 2. Create User with Admin API (auto-confirms email)
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
