import { getScientificFailureProb, calculatePotentiationScore } from '../src/lib/traq/traqLogic';

const mockPotentiatingFactor = {
    id: 5,
    criterio: 'Uniões em V',
    peso: 5,
    requires_probability: false
};

const mockStandardFactor = {
    id: 1,
    criterio: 'Galhos Mortos',
    peso: 3,
    requires_probability: true,
    failure_prob: 'Provável'
};

// Test 1: Potentiation Score
const score1 = calculatePotentiationScore([mockPotentiatingFactor, mockStandardFactor]);
console.log(`Test 1 - Potentiation Score (Expected 8): ${score1} - ${score1 === 8 ? 'PASS' : 'FAIL'}`);

// Test 2: Failure Prob with Mixed Factors
const prob1 = getScientificFailureProb([
    { criterio: mockPotentiatingFactor.criterio, requires_probability: mockPotentiatingFactor.requires_probability }, // No failure_prob
    { criterio: mockStandardFactor.criterio, failure_prob: mockStandardFactor.failure_prob as any, requires_probability: mockStandardFactor.requires_probability }
]);
console.log(`Test 2 - Failure Prob Mixed (Expected Provável): ${prob1.probability} - ${prob1.probability === 'Provável' ? 'PASS' : 'FAIL'}`);

// Test 3: Failure Prob with ONLY Potentiating Factors
const prob2 = getScientificFailureProb([
    { criterio: mockPotentiatingFactor.criterio, requires_probability: mockPotentiatingFactor.requires_probability }
]);
console.log(`Test 3 - Failure Prob Only Potentiating (Expected Improvável): ${prob2.probability} - ${prob2.probability === 'Improvável' ? 'PASS' : 'FAIL'}`);
