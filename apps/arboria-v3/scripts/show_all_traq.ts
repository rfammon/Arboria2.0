import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showAllCriteria() {
    console.log('\n=== ALL TRAQ CRITERIA IN DATABASE ===\n');

    const { data, error } = await supabase
        .from('traq_risk_criteria')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No data found');
        return;
    }

    console.log(`Found ${data.length} records:\n`);

    data.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id} | requires_probability: ${item.requires_probability} | peso: ${item.peso}`);
        console.log(`   ${item.criterio}`);
        console.log('');
    });
}

showAllCriteria();
