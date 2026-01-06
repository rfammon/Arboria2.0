import { getScientificFailureProb, getImpactProb, runTraqMatrices, calculateResidualRisk } from '../src/lib/traq/traqLogic';

function testScenario() {
    console.log("--- Testando Lógica de Risco TRAQ com Overrides (Fatores e Remoção) ---");

    // Alvo: 4 - Constante (Gera Risco Alto se Prob. Falha = Improvável sem override)
    const targetCategory = 4;
    const impactProb = getImpactProb(targetCategory);
    console.log(`Probabilidade de Impacto: ${impactProb}`);

    // Teste 1: Sem fatores (Deve ser BAIXO)
    console.log("\nTeste 1: Sem fatores (hasFactors: false)");
    const riskWithoutFactors = runTraqMatrices('Improvável', impactProb, targetCategory, false);
    console.log(`Risco Resultante: ${riskWithoutFactors}`);

    // Teste 2: Com fatores (Deve ser ALTO/EXTREMO seguindo a matriz)
    console.log("\nTeste 2: Com fatores (hasFactors: true, Prob: Provável)");
    const riskWithFactors = runTraqMatrices('Provável', impactProb, targetCategory, true);
    console.log(`Risco Resultante: ${riskWithFactors}`);

    // Teste 3: Risco Residual com Remoção (Deve ser BAIXO mesmo com Alvo 4)
    console.log("\nTeste 3: Risco Residual com Remoção");
    const { residualRisk: residRiskRemoval } = calculateResidualRisk('Provável', impactProb, targetCategory, 'remocao_arvore', true);
    console.log(`Risco Residual com Remoção: ${residRiskRemoval}`);

    let success = true;
    if (riskWithoutFactors !== 'Baixo') {
        console.log("❌ FALHA: O risco sem fatores deveria ser 'Baixo'.");
        success = false;
    }
    if (riskWithFactors === 'Baixo') {
        console.log("❌ FALHA: O risco com fatores 'Provável' não deveria ser 'Baixo'.");
        success = false;
    }
    if (residRiskRemoval !== 'Baixo') {
        console.log("❌ FALHA: O risco com remoção deveria ser 'Baixo'.");
        success = false;
    }

    if (success) {
        console.log("\n✅ SUCESSO: Todas as lógicas de override funcionaram perfeitamente.");
    } else {
        console.log("\n❌ ERRO: Algum teste falhou.");
    }
}

testScenario();
