import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbfouxrinygecbxmjckg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncCriteria() {
    // 1. Fetch all active criteria
    const { data: criteria, error } = await supabase
        .from('traq_risk_criteria')
        .select('*')
        .eq('ativo', true);

    if (error) {
        console.error('Error fetching criteria:', error);
        return;
    }

    // 2. Identify redundant ones by text matching or specific IDs if known
    // ID 8/9 in defaults was Alvo criteria
    const redundantTexts = [
        'A árvore está próxima a vias públicas ou áreas de circulação?',
        'Há risco de queda sobre edificações, veículos ou pessoas?'
    ];

    const toDeactivate = criteria.filter(c => redundantTexts.includes(c.criterio));

    console.log(`Found ${toDeactivate.length} redundant criteria to deactivate.`);

    for (const item of toDeactivate) {
        const { error: updateError } = await supabase
            .from('traq_risk_criteria')
            .update({ ativo: false })
            .eq('id', item.id);

        if (updateError) console.error(`Failed to deactivate ${item.id}:`, updateError);
        else console.log(`Deactivated: ${item.criterio} (ID: ${item.id})`);
    }
}

syncCriteria();
