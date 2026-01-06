import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkDB() {
    const { data, error } = await supabase
        .from('traq_risk_criteria')
        .select('id, ordem, criterio, requires_probability')
        .order('ordem');

    if (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    console.log('\n=== TRAQ Criteria from Database ===\n');
    data?.forEach(c => {
        const prob = c.requires_probability ? '✅ YES' : '❌ NO';
        console.log(`ID ${c.id} (Q${c.ordem}): ${prob} | ${c.criterio.substring(0, 60)}`);
    });

    process.exit(0);
}

checkDB();
