# ⚠️ Erro 521 - Projeto Supabase Inicializando

## O que está acontecendo?

O erro `521` e `CORS` que você está vendo acontece porque o projeto Supabase **ARBORIA4.0** foi criado recentemente (hoje às 16:27) e os serviços de autenticação ainda estão sendo inicializados.

## Status do Projeto

✅ **Database**: ACTIVE_HEALTHY  
⏳ **Auth Services**: Inicializando...

## Solução: Aguardar Inicialização

### Passo 1: Aguardar (5-10 minutos)

Projetos novos do Supabase podem levar até 10 minutos para ter todos os serviços (especialmente Auth) completamente operacionais.

### Passo 2: Verificar no Dashboard

1. Acesse: https://supabase.com/dashboard/project/oanntkvjehsgwnrnbehd
2. Vá em **Authentication** → **Users**
3. Se a página carregar normalmente, o Auth está pronto

### Passo 3: Reiniciar Dev Server

Depois que o Auth estiver pronto:

```bash
# Pare o servidor (Ctrl+C)
# Depois reinicie
npm run dev
```

### Passo 4: Testar Novamente

Tente fazer login ou cadastro novamente.

## Como Saber se Está Pronto?

Execute este comando no terminal:

```bash
curl -I https://oanntkvjehsgwnrnbehd.supabase.co/auth/v1/settings
```

Se retornar `HTTP/2 200`, o Auth está pronto!  
Se retornar `521`, aguarde mais alguns minutos.

## Enquanto Aguarda...

Você pode:
- ☕ Tomar um café
- 📖 Revisar a documentação
- 🎨 Ajustar o design das páginas
- 📝 Planejar próximas features

## Se Passar de 30 Minutos

Se após 30 minutos ainda estiver com erro:

1. Abra um ticket: https://app.supabase.com/support/new
2. Ou tente pausar e restaurar o projeto no Dashboard

## Alternativa Temporária

Se quiser testar a UI sem esperar, você pode temporariamente:

1. Ir em **Authentication** → **Providers** → **Email**
2. Desmarcar **"Confirm email"**
3. Isso pode ajudar enquanto o Auth inicializa

---

**Projeto criado em:** 2025-12-11 às 16:27 (Horário de Brasília)  
**Tempo decorrido:** ~5 horas  
**Esperado:** Deveria estar pronto, mas pode haver delay no provisionamento
