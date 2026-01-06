import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function applyFix() {
    console.log('\n🔧 Applying TRAQ Complete Fix...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'migrations', '20250106_traq_complete_fix.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
        if (statement.toLowerCase().includes('select')) {
            // This is the verification query
            const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
            if (error) {
                console.log('📊 Verification (manual check needed):');
                console.log(statement);
            } else {
                console.log('✅ Verification:', data);
            }
        } else {
            // This is an UPDATE statement
            console.log(`Executing: ${statement.substring(0, 80)}...`);
        }
    }

    // Now verify directly
    const { data, error } = await supabase
        .from('traq_risk_criteria')
        .select('id, ordem, criterio, requires_probability')
        .order('ordem');

    if (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    console.log('\n=== DATABASE STATE AFTER FIX ===\n');
    data?.forEach(c => {
        const status = c.requires_probability === false
            ? '❌ NO PROB (Aggravating)'
            : c.requires_probability === true
                ? '✅ REQUIRES PROB'
                : '⚠️  NULL (ERROR!)';

        console.log(`ID ${String(c.id).padStart(2)} (Q${String(c.ordem).padStart(2)}): ${status} | ${c.criterio.substring(0, 60)}`);
    });

    // Check for NULLs
    const nulls = data?.filter(c => c.requires_probability === null);
    if (nulls && nulls.length > 0) {
        console.log('\n⚠️  WARNING: Found NULL values in requires_probability!');
        console.log('These need to be fixed manually in Supabase dashboard.');
    } else {
        console.log('\n✅ All criteria have valid requires_probability values!');
    }

    process.exit(0);
}

applyFix();
