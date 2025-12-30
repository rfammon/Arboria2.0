import fs from 'fs';
import path from 'path';

// Simple env parser
const env = fs.readFileSync('apps/arboria-v3/.env', 'utf-8');
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const url = 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-push-notification';

async function test() {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_ids: ['655cdc74-9b9b-41c9-bda9-ae823855f7f3'],
                title: 'Debug',
                body: 'Test Payload'
            })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (e) {
        console.error(e);
    }
}

test();
