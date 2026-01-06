import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
    console.log('\n🔧 Fixing TRAQ Database via Supabase MCP...\n');

    try {
        // Step 1: Set all to true
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

        // Step 2: Set aggravating factors to false
        console.log('Step 2: Setting aggravating factors to requires_probability = false...');
        const aggravatingIds = [18, 19, 23, 24, 25, 27, 28];

        const { error: error2 } = await supabase
            .from('traq_risk_criteria')
            .update({ requires_probability: false })
            .in('id', aggravatingIds);

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

        // Summary
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
            process.exit(1);
        } else if (aggravating.length === 7 && standard.length === 10) {
            console.log('\n✅ DATABASE FIX SUCCESSFUL!');
            console.log('\n🎯 Aggravating factors (should NOT show probability):');
            aggravating.forEach(c => console.log(`   - Q${String(c.ordem).padStart(2)}: ${c.criterio.substring(0, 50)}`));
            console.log('\n✨ Next step: Hard refresh your browser (Ctrl+Shift+R) and test!');
        } else {
            console.log('\n⚠️  Unexpected counts! Expected 7 aggravating and 10 standard.');
            process.exit(1);
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

fixDatabase();
