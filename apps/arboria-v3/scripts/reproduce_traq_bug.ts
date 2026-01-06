import { getScientificFailureProb, getImpactProb, runTraqMatrices } from '../src/lib/traq/traqLogic';

function testScenario() {
    console.log("--- Testando Lógica de Risco TRAQ com Override ---");

    // Sem fatores selecionados
    const selectedFactors = [];
    const { probability: failureProb } = getScientificFailureProb(selectedFactors);
    console.log(`Probabilidade de Falha: ${failureProb}`);

    // Taxa de ocupação: 4 - Constante
    const targetCategory = 4;
    const impactProb = getImpactProb(targetCategory);
    console.log(`Probabilidade de Impacto: ${impactProb}`);

    // Teste 1: Sem fatores (Deve ser BAIXO)
    console.log("\nTeste 1: Sem fatores (hasFactors: false)");
    const riskWithoutFactors = runTraqMatrices(failureProb, impactProb, targetCategory, false);
    console.log(`Risco Resultante: ${riskWithoutFactors}`);

    // Teste 2: Com fatores simulados (Deve seguir a matriz - ex: Provável + Alto = Extremo)
    console.log("\nTeste 2: Com fatores (hasFactors: true, Prob: Provável)");
    const riskWithFactors = runTraqMatrices('Provável', impactProb, targetCategory, true);
    console.log(`Risco Resultante: ${riskWithFactors}`);

    if (riskWithoutFactors !== 'Baixo') {
        console.log("\n❌ FALHA: O risco sem fatores deveria ser 'Baixo'.");
    } else if (riskWithFactors === 'Baixo') {
        console.log("\n❌ FALHA: O risco com fatores 'Provável' não deveria ser 'Baixo'.");
    } else {
        console.log("\n✅ SUCESSO: Logica de override funcionando corretamente.");
    }
}

testScenario();
