import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials
const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthFlow() {
    const email = 'rafa.elammon+authtest@gmail.com'; // Using alias to avoid conflict
    const password = 'teste123';

    console.log(`Creating unconfirmed user ${email}...`);

    // 1. Delete if exists to be clean
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError) {
        const existing = users.users.find(u => u.email === email);
        if (existing) {
            await supabase.auth.admin.deleteUser(existing.id);
            console.log('Deleted existing test user.');
        }
    }

    // 2. Create User WITHOUT auto-confirm
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Ensure confirmation is required -> triggers email
        user_metadata: {
            nome: 'Auth Test User'
        }
    });

    if (createError) {
        console.log('Error creating user:', createError);
    } else {
        console.log('User created:', newUser.user.id);
        console.log('Check Supabase Edge Function logs to confirm email dispatch.');
    }
}

testAuthFlow();
