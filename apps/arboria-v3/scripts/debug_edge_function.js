import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const FUNCTION_URL = `${supabaseUrl}/functions/v1/send-notification-email`;

async function debugEdgeFunction() {
    const payload = {
        user_id: 'b9dd1531-97b7-482a-a23d-4c330777fa09',
        type: 'signup_confirmation',
        message: 'Test debug',
        token: '123456',
        redirect_to: 'http://localhost'
    };

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: users } = await supabase.auth.admin.listUsers();
    if (users && users.users.length > 0) {
        payload.user_id = users.users[0].id; // Use first found user
        console.log('Using User ID:', payload.user_id);
    }

    try {
        console.log('Fetching...');
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();

        console.log('Status:', status);
        const output = `Status: ${status}\nBody: ${text}`;
        fs.writeFileSync('debug_output.txt', output);
        console.log('Output written to debug_output.txt');

    } catch (e) {
        console.error('Error:', e);
        fs.writeFileSync('debug_output.txt', `Error: ${e.message}`);
    }
}

debugEdgeFunction();
