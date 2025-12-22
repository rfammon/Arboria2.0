import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.13'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
    notification_id: string
    user_id?: string
    email?: string
    type: string
    message: string
    task_id?: string
    instalacao_name?: string
    token?: string
    redirect_to?: string
}

interface EmailTemplate {
    subject: string
    html: string
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        // SMTP Configuration
        const smtpUser = Deno.env.get('SMTP_USER')
        const smtpPass = Deno.env.get('SMTP_PASS')

        if (!smtpUser || !smtpPass) {
            console.log('SMTP Config missing - skipping email')
            return new Response(JSON.stringify({ skipped: true, reason: 'SMTP credentials missing' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const payload: NotificationPayload = await req.json()
        const { notification_id, user_id, type, message, task_id, instalacao_name, token, redirect_to } = payload

        // Get user email
        let userEmail = payload.email; // Allow direct email from payload
        let validUser = true;

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        if (user_id) {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id)
            if (userError || !userData?.user?.email) {
                console.error('User not found:', userError)
                validUser = false;
            } else {
                userEmail = userData.user.email
            }
        }

        if (!userEmail) {
            return new Response(JSON.stringify({ error: 'No recipient email found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Check user email preferences
        // Check user email preferences
        let prefs = null
        if (user_id) {
            const { data } = await supabase
                .from('user_notification_preferences')
                .select('*')
                .eq('user_id', user_id)
                .single()
            prefs = data
        }

        // Check if email is enabled for this notification type
        if (prefs) {
            if (!prefs.email_enabled) {
                console.log('User has disabled email notifications')
                return new Response(JSON.stringify({ skipped: true, reason: 'User disabled emails' }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            // Check specific notification type preference
            // Note: 'signup_confirmation' is mandatory/system, so we might skip preference check or add a specific one later.
            // For now, assuming it's critical and bypasses generic 'enabled' check if needed, but keeping logic consistent.

            const prefMap: Record<string, string> = {
                'ACCESS_REQUEST': 'email_access_requests',
                'APPROVED': 'email_approvals',
                'REJECTED': 'email_approvals',
                'INVITE': 'email_invites',
                'TASK_COMPLETED': 'email_task_completion'
            }

            const prefKey = prefMap[type]
            if (prefKey && prefs[prefKey] === false) {
                console.log(`User has disabled ${type} emails`)
                return new Response(JSON.stringify({ skipped: true, reason: `User disabled ${type}` }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        }

        // Generate email content
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
        const { subject, html } = generateEmailContent(type, message, appUrl, task_id, instalacao_name, token, redirect_to)

        // Configure Transporter with Gmail SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        })

        // Send Email
        await transporter.sendMail({
            from: `"ArborIA System" <${smtpUser}>`,
            to: userEmail,
            subject: subject,
            html: html,
        })

        // Mark notification as email sent
        if (notification_id) {
            await supabase
                .from('notifications')
                .update({
                    email_sent: true,
                    email_sent_at: new Date().toISOString()
                })
                .eq('id', notification_id)
        }

        console.log(`Email sent to ${userEmail} for ${type} via Outlook`)

        return new Response(JSON.stringify({ success: true, email: userEmail }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Error in send-notification-email:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

function generateEmailContent(
    type: string,
    message: string,
    appUrl: string,
    taskId?: string,
    instalacaoName?: string,
    token?: string,
    redirectTo?: string
): EmailTemplate {
    const brandColor = '#15803d' // Green-700
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mbfouxrinygecbxmjckg.supabase.co'

    // Using a simpler HTML template for better Gmail compatibility
    const baseTemplate = (content: string, buttonText?: string, buttonUrl?: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${brandColor}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🌳 ArborIA</h1>
        </div>
        <div style="padding: 24px; background-color: white;">
            ${content}
            ${buttonText && buttonUrl ? `
            <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
                <a href="${buttonUrl}" style="background-color: ${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    ${buttonText}
                </a>
            </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
            <p style="font-size: 12px; color: #71717a; text-align: center;">
                © ${new Date().getFullYear()} ArborIA. Você recebeu este email porque tem notificações ativas.
                <br>
                <a href="${appUrl}/configuracoes" style="color: #71717a;">Gerenciar preferências</a>
            </p>
        </div>
    </div>
    `

    const templates: Record<string, EmailTemplate> = {
        'signup_confirmation': {
            subject: 'Confirmar sua conta - ArborIA',
            html: baseTemplate(
                `<h2 style="color: #18181b; margin-top: 0;">Bem-vindo ao ArborIA!</h2>
                 <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">Obrigado por se cadastrar. Para começar, por favor confirme seu email clicando no botão abaixo.</p>`,
                'Confirmar Email',
                `${supabaseUrl}/auth/v1/verify?token=${token}&type=signup&redirect_to=${redirectTo || appUrl}`
            )
        },
        'ACCESS_REQUEST': {
            subject: `🌳 Nova solicitação de acesso${instalacaoName ? ` - ${instalacaoName}` : ''}`,
            html: baseTemplate(
                `<h2 style="color: #18181b; margin-top: 0;">Nova Solicitação de Acesso</h2>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">${message}</p>
                <p style="color: #52525b; margin-top: 16px;">Acesse o painel para aprovar ou rejeitar.</p>`,
                'Ver Solicitação',
                `${appUrl}/instalacoes`
            )
        },
        'APPROVED': {
            subject: '✅ Acesso aprovado - ArborIA',
            html: baseTemplate(
                `<h2 style="color: #18181b; margin-top: 0;">Acesso Aprovado!</h2>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">${message}</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 16px;">Bem-vindo(a) à equipe!</p>`,
                'Acessar Sistema',
                appUrl
            )
        },
        'REJECTED': {
            subject: '❌ Solicitação não aprovada - ArborIA',
            html: baseTemplate(
                `<h2 style="color: #18181b; margin-top: 0;">Solicitação Não Aprovada</h2>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">${message}</p>
                <p style="color: #52525b; margin-top: 16px;">Entre em contato com o gestor se tiver dúvidas.</p>`
            )
        },
        'INVITE': {
            subject: '📧 Convite para ArborIA',
            html: baseTemplate(
                `<h2 style="color: #18181b; margin-top: 0;">Você foi convidado!</h2>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">${message}</p>
                <p style="color: #52525b; margin-top: 16px;">Crie sua conta para aceitar o convite.</p>`,
                'Criar Conta',
                `${appUrl}/#/login?mode=signup`
            )
        },
        'TASK_COMPLETED': {
            subject: '✓ Tarefa concluída - ArborIA',
            html: baseTemplate(
                `<h2 style="color: #18181b; margin-top: 0;">Tarefa Concluída</h2>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">${message}</p>
                <p style="color: #52525b; margin-top: 16px;">Veja os detalhes da execução e fotos.</p>`,
                'Ver Tarefa',
                taskId ? `${appUrl}/execucao?task=${taskId}` : `${appUrl}/execucao`
            )
        }
    }

    return templates[type] || {
        subject: '🌳 Notificação ArborIA',
        html: baseTemplate(
            `<h2 style="color: #18181b; margin-top: 0;">Nova Notificação</h2>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">${message}</p>`,
            'Abrir App',
            appUrl
        )
    }
}
