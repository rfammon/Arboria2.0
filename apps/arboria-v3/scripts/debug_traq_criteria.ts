import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCriteria() {
    console.log('\n=== CHECKING TRAQ CRITERIA IN DATABASE ===\n');

    const { data, error } = await supabase
        .from('traq_risk_criteria')
        .select('id, criterio, requires_probability, peso, ordem')
        .eq('ativo', true)
        .order('ordem');

    if (error) {
        console.error('❌ Error fetching criteria:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No data found in database.');
        return;
    }

    console.log(`✅ Found ${data.length} records in database\n`);

    // Focus on the problematic ones
    const problemIds = [5, 6, 10, 11, 12, 14, 15];

    console.log('AGGRAVATING FACTORS (should have requires_probability = false):');
    console.log('================================================================');
    problemIds.forEach(id => {
        const record = data.find(c => c.id === id);
        if (record) {
            const status = record.requires_probability === false ? '✅' : '❌';
            console.log(`${status} ID ${id}: ${record.criterio}`);
            console.log(`   requires_probability: ${record.requires_probability}`);
            console.log(`   peso: ${record.peso}\n`);
        } else {
            console.log(`⚠️  ID ${id}: NOT FOUND\n`);
        }
    });

    console.log('\nSTANDARD FACTORS (should have requires_probability = true):');
    console.log('===========================================================');
    const standardIds = [1, 2, 3, 4, 7, 13, 16, 17];
    standardIds.forEach(id => {
        const record = data.find(c => c.id === id);
        if (record) {
            const status = record.requires_probability === true ? '✅' : '❌';
            console.log(`${status} ID ${id}: ${record.criterio}`);
            console.log(`   requires_probability: ${record.requires_probability}\n`);
        }
    });
}

checkCriteria();
