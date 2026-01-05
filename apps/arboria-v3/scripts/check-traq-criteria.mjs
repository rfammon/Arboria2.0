import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCriteria() {
    const { data, error } = await supabase.from('traq_risk_criteria').select('*').eq('ativo', true).order('ordem');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log(`Found ${data.length} active criteria in DB.`);
    data.forEach(c => console.log(`- [${c.id}] ${c.criterio}`));
}

checkCriteria();
