import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const userId = '0458eee1-78bd-42c4-a71d-4c0ed28e6f99';

async function debugNotification() {
    console.log(`🔍 Debugging notifications for ${userId}`);

    const { data: notes, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Encontradas ${notes.length} notificações.`);
    notes.forEach(n => {
        console.log(`---
ID: ${n.id}
Title: ${n.title}
Type: ${n.type}
Instalacao: ${n.installation_id}
Read: ${n.is_read}
Created: ${n.created_at}
---`);
    });
}

debugNotification();
