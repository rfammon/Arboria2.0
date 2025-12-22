-- Create Invite Table
CREATE TABLE IF NOT EXISTS public.instalacao_convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instalacao_id UUID NOT NULL REFERENCES public.instalacoes(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    perfis UUID[] NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(instalacao_id, email)
);

-- RLS for Invites
ALTER TABLE public.instalacao_convites ENABLE ROW LEVEL SECURITY;

-- Policy: Gestores can see invites for their installations
CREATE POLICY "Gestores can view invites" ON public.instalacao_convites
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.instalacao_membros im
            JOIN public.perfis p ON p.id = ANY(im.perfis)
            WHERE im.instalacao_id = instalacao_convites.instalacao_id
            AND im.user_id = auth.uid()
            AND p.nome = 'Gestor'
        )
    );

-- Logic to consume invite on signup
CREATE OR REPLACE FUNCTION public.consume_invite_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    invite RECORD;
BEGIN
    -- Loop through any invites for this email
    FOR invite IN 
        SELECT * FROM public.instalacao_convites 
        WHERE email = NEW.email 
    LOOP
        -- Add to installation members
        INSERT INTO public.instalacao_membros (instalacao_id, user_id, perfis, status)
        VALUES (invite.instalacao_id, NEW.id, invite.perfis, 'ativo')
        ON CONFLICT (instalacao_id, user_id) DO NOTHING;

        -- Create Notification
        INSERT INTO public.notifications (user_id, type, message, instalacao_id)
        VALUES (NEW.id, 'APPROVED', 'Você entrou automaticamente na instalação via convite.', invite.instalacao_id);

        -- Delete used invite
        DELETE FROM public.instalacao_convites WHERE id = invite.id;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on User Creation
DROP TRIGGER IF EXISTS on_auth_user_created_consume_invite ON auth.users;
CREATE TRIGGER on_auth_user_created_consume_invite
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.consume_invite_on_signup();

-- Main RPC Function to Invite
CREATE OR REPLACE FUNCTION public.invite_user_to_installation(
    p_instalacao_id UUID,
    p_email TEXT,
    p_perfis UUID[]
)
RETURNS JSONB AS $$
DECLARE
    v_target_user_id UUID;
    v_is_gestor BOOLEAN;
    v_result JSONB;
BEGIN
    -- 1. Check Permissions (Must be Gestor of the installation)
    SELECT EXISTS (
        SELECT 1 FROM public.instalacao_membros im
        JOIN public.perfis p ON p.id = ANY(im.perfis)
        WHERE im.instalacao_id = p_instalacao_id
        AND im.user_id = auth.uid()
        AND p.nome = 'Gestor'
    ) INTO v_is_gestor;

    IF NOT v_is_gestor THEN
        RAISE EXCEPTION 'Acesso negado. Apenas gestores podem convidar.';
    END IF;

    -- 2. Check if user exists
    SELECT id INTO v_target_user_id FROM auth.users WHERE email = p_email;

    IF v_target_user_id IS NOT NULL THEN
        -- USER EXISTS: Add directly
        INSERT INTO public.instalacao_membros (instalacao_id, user_id, perfis, status)
        VALUES (p_instalacao_id, v_target_user_id, p_perfis, 'ativo')
        ON CONFLICT (instalacao_id, user_id) 
        DO UPDATE SET perfis = array_cat(instalacao_membros.perfis, p_perfis); -- Merge profiles if already there

        -- Notify
        INSERT INTO public.notifications (user_id, type, message, instalacao_id)
        VALUES (v_target_user_id, 'INVITE', 'Você foi adicionado a uma nova instalação.', p_instalacao_id);

        v_result := jsonb_build_object('status', 'added', 'user_id', v_target_user_id);
    ELSE
        -- USER DOES NOT EXIST: Create Invite
        INSERT INTO public.instalacao_convites (instalacao_id, email, perfis, created_by)
        VALUES (p_instalacao_id, p_email, p_perfis, auth.uid())
        ON CONFLICT (instalacao_id, email) 
        DO UPDATE SET perfis = p_perfis, expires_at = (NOW() + INTERVAL '7 days');

        -- Create Notification (System notification to trigger email via Edge Function)
        -- We use a NULL user_id hack or we need another way to trigger the email for non-users.
        -- BUT: The 'notifications' table references auth.users(id). We cannot insert NULL or a non-existent ID.
        -- SOLUTION: We'll trigger the email directly via pg_net inside this function, OR 
        -- we create a separate table for system events?
        -- EASIER: Just use pg_net directly here for the specific case of external invite.
        
        PERFORM net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-notification-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
                'user_id', auth.uid(), -- Send as 'sender' for context? No, payload expects target.
                -- Wait, the Edge Function expects 'user_id' to look up email. 
                -- We CANNOT use the Edge Function as-is because it does `getUserById(user_id)`.
                -- We need to update the Edge Function to accept direct 'email' too.
                'email', p_email, -- Passing direct email
                'type', 'INVITE',
                'message', 'Você foi convidado para participar do ArborIA.',
                'instalacao_name', (SELECT nome FROM public.instalacoes WHERE id = p_instalacao_id)
            )
        );

        v_result := jsonb_build_object('status', 'invited', 'email', p_email);
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
