# Configuração do Supabase - Arboria v3

## Usando o Sistema de Email Built-in do Supabase

O Supabase já vem com um sistema de email integrado! Não precisa configurar SMTP externo.

### Configuração Rápida (2 minutos)

1. **Acesse o Dashboard**: https://supabase.com/dashboard/project/oanntkvjehsgwnrnbehd

2. **Configurar URLs de Redirecionamento**:
   - Vá em **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:5174`
   - **Redirect URLs**: Adicione:
     - `http://localhost:5174/**`
     - `http://localhost:5174/auth/callback`

3. **Verificar Email Provider**:
   - Vá em **Authentication** → **Providers** → **Email**
   - Certifique-se que **"Enable Email provider"** está marcado
   - **"Confirm email"** pode ficar marcado (recomendado)
   - Deixe **"Enable email confirmations"** marcado

4. **Pronto!** O Supabase usa o próprio servidor de email.

### Limitações do Email Built-in

- **Desenvolvimento**: ~3-4 emails/hora (suficiente para testes)
- **Produção**: Recomenda-se configurar SMTP próprio para maior volume
- Os emails vêm de `noreply@mail.app.supabase.io`

### Personalizar Template de Email (Opcional)

Em **Authentication** → **Email Templates** → **Confirm signup**:

```html
<h2>Bem-vindo ao ArborIA!</h2>
<p>Olá!</p>
<p>Clique no link abaixo para confirmar seu cadastro:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Ou use este código de confirmação: <strong>{{ .Token }}</strong></p>
<br>
<p>Se você não solicitou este cadastro, ignore este email.</p>
```

### Como Funciona o Fluxo

1. **Usuário se cadastra** com nome, matrícula, email e senha
2. **Supabase envia email** automaticamente usando servidor built-in
3. **Usuário clica no link** de confirmação no email
4. **Email é verificado** e usuário pode fazer login
5. **Redirecionamento** de volta para a aplicação

### Testar o Cadastro

Você pode testar agora:

1. Vá em http://localhost:5174/login
2. Clique em "Cadastre-se"
3. Preencha os dados e envie
4. Aguarde o email chegar (pode demorar 1-2 minutos)
5. Clique no link de confirmação
6. Faça login!

### Verificar Emails Enviados

No Dashboard do Supabase:
- Vá em **Authentication** → **Users**
- Você verá o status "Waiting for verification" até o usuário confirmar

### Se Não Receber o Email

Verifique:
1. **Caixa de spam/lixeira**
2. **Email correto** digitado no cadastro
3. **Aguarde 2-3 minutos** (o sistema built-in pode ter delay)

### Reenviar Email de Confirmação

Se precisar reenviar, você pode:

```javascript
await supabase.auth.resend({
  type: 'signup',
  email: 'usuario@exemplo.com'
})
```

## Para Produção (Futuro)

Quando o projeto crescer e precisar enviar mais emails, configure SMTP próprio:

### Opções Recomendadas:

- **Resend**: 3000 emails/mês grátis
- **SendGrid**: 100 emails/dia grátis  
- **Amazon SES**: Muito barato ($0.10 por 1000 emails)

Configure em: **Project Settings** → **Auth** → **SMTP Settings**

## Informações do Projeto

- **Nome**: ARBORIA4.0
- **ID**: oanntkvjehsgwnrnbehd
- **Região**: us-east-1
- **Dashboard**: https://supabase.com/dashboard/project/oanntkvjehsgwnrnbehd

