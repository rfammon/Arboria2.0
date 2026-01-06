import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCriteria() {
    console.log('Fetching all criteria...');
    const { data, error } = await supabase
        .from('traq_risk_criteria')
        .select('*')
        .order('id');

    if (error) {
        console.error('Error fetching criteria:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No data found.');
        return;
    }

    console.log('Found', data.length, 'records.');
    console.log('Sample record (ID 5):', data.find(c => c.id === 5));
    console.log('Sample record (ID 10):', data.find(c => c.id === 10));
    console.log('Sample record (ID 1):', data.find(c => c.id === 1));
}

checkCriteria();
