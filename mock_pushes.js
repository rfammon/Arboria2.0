import fs from 'fs';
import path from 'path';

// Simple env parser to get key
const env = fs.readFileSync('apps/arboria-v3/.env', 'utf-8');
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const url = 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-push-notification';

async function sendMockOta() {
    console.log('Sending Mock OTA Update Notification...');
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_ids: ['655cdc74-9b9b-41c9-bda9-ae823855f7f3'], // Replace with target User ID if different
                title: 'Nova Atualização Disponível 🚀',
                body: 'A versão 1.0.21 já está disponível. Toque para atualizar agora.',
                category: 'ota_update',
                data: {
                    type: 'ota_update',
                    route: '/settings'
                }
            })
        });

        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error('Error:', e);
    }
}

async function sendMockAlert() {
    console.log('Sending Mock General Alert...');
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_ids: ['655cdc74-9b9b-41c9-bda9-ae823855f7f3'], // Replace with target User ID if different
                title: 'Novo Alerta de Sistema',
                body: 'Você tem uma nova tarefa pendente. Toque para ver.',
                category: 'alert',
                data: {
                    type: 'alert'
                    // No route provided, should fallback to /alerts
                }
            })
        });

        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error('Error:', e);
    }
}

const type = process.argv[2] || 'ota';

if (type === 'ota') {
    sendMockOta();
} else {
    sendMockAlert();
}
