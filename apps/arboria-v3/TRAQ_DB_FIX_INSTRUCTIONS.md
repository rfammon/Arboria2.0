# TRAQ Database Fix - Manual Steps

## Problem
The `requires_probability` column has incorrect or NULL values, causing:
1. Probability buttons showing for aggravating factors
2. Aggravating factors list showing "Nenhum fator agravante identificado"

## Solution
Run these SQL commands in Supabase SQL Editor:

### Step 1: Set all to TRUE (default)
```sql
UPDATE traq_risk_criteria 
SET requires_probability = true;
```

### Step 2: Set aggravating factors to FALSE
```sql
UPDATE traq_risk_criteria 
SET requires_probability = false
WHERE id IN (18, 19, 23, 24, 25, 27, 28);
```

### Step 3: Verify
```sql
SELECT 
    id,
    ordem,
    criterio,
    requires_probability,
    CASE 
        WHEN requires_probability = false THEN '❌ NO PROB (Aggravating)'
        WHEN requires_probability = true THEN '✅ REQUIRES PROB'
        ELSE '⚠️  NULL (ERROR!)'
    END as status
FROM traq_risk_criteria
ORDER BY ordem;
```

## Expected Result
- **7 aggravating factors** (requires_probability = false): IDs 18, 19, 23, 24, 25, 27, 28
- **10 standard factors** (requires_probability = true): All others
- **0 NULL values**

## Aggravating Factors (Question Numbers)
- Q6 (ID 18): "Há galhos cruzados ou friccionando entre si?"
- Q7 (ID 19): "A árvore apresenta copa assimétrica (>30% de desequilíbrio)?"
- Q9 (ID 23): "A árvore interfere em redes elétricas ou estruturas urbanas?"
- Q10 (ID 24): "A espécie é conhecida por apresentar alta taxa de falhas?"
- Q11 (ID 25): "A árvore já sofreu podas drásticas ou brotação epicórmica intensa?"
- Q14 (ID 27): "Há perda visível de raízes de sustentação (>40%)?"
- Q15 (ID 28): "Há sinais de compactação ou asfixia radicular?"
