import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTRAQ() {
    console.log('\n=== FIXING TRAQ CRITERIA ===\n');

    // Aggravating factors (no probability)
    const aggravatingIds = [18, 19, 23, 24, 25, 27, 28];
    console.log('Setting aggravating factors (requires_probability = false)...');
    const { error: error1 } = await supabase
        .from('traq_risk_criteria')
        .update({ requires_probability: false })
        .in('id', aggravatingIds);

    if (error1) {
        console.error('❌ Error updating aggravating factors:', error1);
        return;
    }
    console.log('✅ Updated IDs:', aggravatingIds.join(', '));

    // Standard factors (with probability)
    const standardIds = [13, 14, 15, 16, 17, 20, 26, 29];
    console.log('\nSetting standard factors (requires_probability = true)...');
    const { error: error2 } = await supabase
        .from('traq_risk_criteria')
        .update({ requires_probability: true })
        .in('id', standardIds);

    if (error2) {
        console.error('❌ Error updating standard factors:', error2);
        return;
    }
    console.log('✅ Updated IDs:', standardIds.join(', '));

    // Verify
    console.log('\n=== VERIFICATION ===\n');
    const { data, error: error3 } = await supabase
        .from('traq_risk_criteria')
        .select('id, criterio, requires_probability')
        .order('ordem');

    if (error3) {
        console.error('❌ Error verifying:', error3);
        return;
    }

    console.log('Current state:');
    data?.forEach(item => {
        const status = item.requires_probability === false ? '🔴 NO PROB' : '🟢 WITH PROB';
        console.log(`${status} | ID ${item.id}: ${item.criterio.substring(0, 50)}...`);
    });

    console.log('\n✅ FIX COMPLETE!');
}

fixTRAQ();
