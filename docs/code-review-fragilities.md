# Relatório de Revisão de Código: Fragilidades e Melhorias - ArborIA v3

**Data:** 21 de Janeiro de 2026
**Assunto:** Análise de fragilidades técnicas e sugestões de arquitetura.

## 1. Gestão de Conectividade e Sincronização Offline

### Fragilidade: Dependência do `navigator.onLine`
No arquivo `useTreeMutations.ts`, a lógica de sincronização depende estritamente do `navigator.onLine` para decidir se envia os dados para o Supabase ou se os coloca na fila offline.

*   **Problema:** O `navigator.onLine` é pouco confiável. Ele retorna `true` se o dispositivo estiver conectado a uma rede (como um roteador Wi-Fi), mesmo que essa rede não tenha acesso à internet (o famoso "Captive Portal" ou falha de link).
*   **Risco:** Tentativas de mutação online que falham silenciosamente ou geram erros de rede não capturados, resultando em uma experiência de usuário truncada.
*   **Sugestão:** 
    *   Implementar um mecanismo de "Heartbeat" (ping) para verificar a conectividade real.
    *   Melhor ainda: Tentar a operação online e, se falhar com um erro de rede (`FetchError`), mover automaticamente para a fila offline, independente do status reportado pelo navegador.

---

## 2. Manutenção de Schema e Sanitização de Dados

### Fragilidade: Lista Estática de `allowedFields`
No hook `useTreeMutations.ts`, a função `updateTree` utiliza um array fixo `allowedFields` para sanitizar o payload antes do envio.

*   **Problema:** Cada vez que uma nova coluna for adicionada à tabela `arvores` no Postgres, um desenvolvedor precisará lembrar de atualizar manualmente este array no frontend.
*   **Risco:** Manutenção custosa e "bugs silenciosos" onde novos campos preenchidos pelo usuário são descartados pelo frontend antes de chegarem ao banco de dados.
*   **Sugestão:** 
    *   Utilizar uma biblioteca de validação como **Zod** para definir o schema de forma centralizada.
    *   Derivar os campos permitidos diretamente das definições de tipo do TypeScript geradas pelo Supabase.

---

## 3. Experiência do Usuário e Bloqueio de Thread

### Fragilidade: Uso de `window.alert` para Erros
Em `useTreeMutations.ts`, o bloco `onError` dispara um `window.alert` com detalhes técnicos do erro.

*   **Problema:** O `alert()` é uma função bloqueante. Ele interrompe toda a execução do JavaScript e a interação do usuário até que o botão "OK" seja clicado. Em um ambiente de campo, isso é altamente disruptivo.
*   **Risco:** Frustração do usuário e potencial travamento da interface em casos de erros repetitivos.
*   **Sugestão:** 
    *   Substituir todos os `window.alert` pelo componente de `toast` (Sonner) já presente no projeto.
    *   Implementar um log de erros persistente (ou via Sentry) para diagnósticos técnicos, mostrando ao usuário apenas o que for acionável.

---

## 4. Inicialização de Permissões e Contexto de Autenticação

### Fragilidade: Carregamento Assíncrono do `profileMap`
No `AuthContext.tsx`, as permissões do usuário dependem do `profileMap`, que é carregado em um `useEffect` separado do login.

*   **Problema:** Existe uma condição de corrida (race condition). O usuário pode estar autenticado, mas as permissões ainda estarem sendo calculadas ou o mapa de perfis ainda não ter sido carregado.
*   **Risco:** O app pode renderizar componentes com "Acesso Negado" ou redirecionar o usuário incorretamente nos primeiros segundos após o carregamento da página.
*   **Sugestão:** 
    *   Manter o estado `loading` como `true` no `AuthContext` até que *ambos* os dados (sessão e perfis) estejam prontos.
    *   Integrar o carregamento dos perfis na lógica inicial de `getSession`.

---

## 5. Integridade de Dados em Uploads de Mídia

### Fragilidade: Rollback Manual de Metadados
No `photoUploadService.ts`, o sistema faz o upload para o Storage e depois tenta inserir os metadados no banco de dados. Se a inserção falhar, ele tenta deletar o arquivo do Storage manualmente.

*   **Problema:** Se o navegador for fechado ou o dispositivo perder a conexão exatamente entre o upload e a inserção de metadados, o arquivo ficará "órfão" no storage (ocupando espaço sem referência no DB).
*   **Risco:** Acúmulo de arquivos inúteis no Supabase Storage e inconsistência entre o que existe em disco vs banco de dados.
*   **Sugestão:** 
    *   Utilizar uma **Edge Function** do Supabase para realizar ambas as operações em uma "transação" lógica no lado do servidor.
    *   Ou implementar uma rotina de limpeza (cron job) que identifique e remova arquivos no storage que não possuem entrada correspondente na tabela `tree_photos`.

---

## 6. Performance e Renderização do Mapa

### Fragilidade: Recriação Frequente de GeoJSON
O `MapComponent.tsx` reconstrói o objeto GeoJSON completo (`createGeoJSON`) sempre que a lista de árvores muda.

*   **Problema:** Embora use `useCallback`, a função é disparada em cascata. Para milhares de pontos, a conversão de Array para GeoJSON em cada renderização ou atualização pode causar lentidão na UI.
*   **Risco:** Jittering (engasgos) durante o scroll ou zoom do mapa quando há atualizações em tempo real.
*   **Sugestão:** 
    *   Utilizar `useMemo` para memoizar o resultado do GeoJSON, garantindo que ele só seja recalculado se o array `trees` realmente mudar em profundidade.
    *   Implementar **clustering** (agrupamento de pontos) para visualizações em zoom baixo, reduzindo o número de nós que o MapLibre precisa gerenciar simultaneamente.

---

## 7. Segurança de Credenciais em Scripts de Teste

### Fragilidade: Senhas Hardcoded em Scripts
Arquivos como `test_auth_flow.js` e `create_test_user.js` contêm senhas em texto plano (ex: `teste123`).

*   **Problema:** Mesmo sendo scripts de teste, existe o risco de serem commitados ou vazados, expondo padrões de teste que podem ser explorados.
*   **Sugestão:** Utilizar variáveis de ambiente (`.env`) também para os scripts de utilidade e testes, mantendo o repositório livre de qualquer segredo.

---

## Conclusão
O código demonstra uma arquitetura sólida e moderna, utilizando as melhores ferramentas do ecossistema React/Supabase. As fragilidades encontradas são, em sua maioria, relacionadas a cenários de borda (edge cases) de conectividade e manutenção a longo prazo. A implementação das melhorias sugeridas elevará a robustez do ArborIA v3 para um nível de resiliência industrial.
