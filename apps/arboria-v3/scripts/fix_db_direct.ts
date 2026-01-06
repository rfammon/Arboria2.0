import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function fixDatabase() {
    console.log('\n🔧 Fixing TRAQ Database...\n');

    // Step 1: Set ALL to true first
    console.log('Step 1: Setting all criteria to requires_probability = true...');
    const { error: error1 } = await supabase
        .from('traq_risk_criteria')
        .update({ requires_probability: true })
        .neq('id', 0); // Update all rows

    if (error1) {
        console.error('❌ Error in step 1:', error1);
        process.exit(1);
    }
    console.log('✅ Step 1 complete\n');

    // Step 2: Set potentiating factors to false
    console.log('Step 2: Setting potentiating factors to requires_probability = false...');
    const potentiatingIds = [18, 19, 23, 24, 25, 27, 28];

    const { error: error2 } = await supabase
        .from('traq_risk_criteria')
        .update({ requires_probability: false })
        .in('id', potentiatingIds);

    if (error2) {
        console.error('❌ Error in step 2:', error2);
        process.exit(1);
    }
    console.log('✅ Step 2 complete\n');

    // Step 3: Verify
    console.log('Step 3: Verifying changes...\n');
    const { data, error: error3 } = await supabase
        .from('traq_risk_criteria')
        .select('id, ordem, criterio, requires_probability')
        .order('ordem');

    if (error3) {
        console.error('❌ Error in step 3:', error3);
        process.exit(1);
    }

    console.log('=== DATABASE STATE ===\n');
    data?.forEach(c => {
        const status = c.requires_probability === false
            ? '❌ NO PROB (Aggravating)'
            : c.requires_probability === true
                ? '✅ REQUIRES PROB'
                : '⚠️  NULL (ERROR!)';

        const idStr = String(c.id).padStart(2);
        const qStr = String(c.ordem).padStart(2);
        console.log(`ID ${idStr} (Q${qStr}): ${status} | ${c.criterio.substring(0, 55)}`);
    });

    // Check for issues
    const aggravating = data?.filter(c => c.requires_probability === false) || [];
    const standard = data?.filter(c => c.requires_probability === true) || [];
    const nulls = data?.filter(c => c.requires_probability === null) || [];

    console.log(`\n📊 Summary:`);
    console.log(`   - Aggravating factors (no probability): ${aggravating.length}`);
    console.log(`   - Standard factors (with probability): ${standard.length}`);
    console.log(`   - NULL values (ERROR): ${nulls.length}`);

    if (nulls.length > 0) {
        console.log('\n⚠️  WARNING: Found NULL values!');
        nulls.forEach(c => console.log(`   - ID ${c.id}: ${c.criterio}`));
    } else if (aggravating.length === 7 && standard.length === 10) {
        console.log('\n✅ DATABASE FIX SUCCESSFUL!');
        console.log('\nAggravating factors (should NOT show probability):');
        aggravating.forEach(c => console.log(`   - Q${c.ordem}: ${c.criterio.substring(0, 50)}`));
    } else {
        console.log('\n⚠️  Unexpected counts! Expected 7 aggravating and 10 standard.');
    }

    process.exit(0);
}

fixDatabase();
