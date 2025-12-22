-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES public.instalacoes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'tree', 'plan', 'photo'
    entity_id UUID NOT NULL,
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    installation_id UUID REFERENCES public.instalacoes(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'INFO', -- 'INFO', 'WARNING', 'SUCCESS', 'ERROR'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_link TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for activity_logs
DROP POLICY IF EXISTS "Users can view logs of their installation" ON public.activity_logs;
CREATE POLICY "Users can view logs of their installation" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.instalacao_membros m
            WHERE m.user_id = auth.uid() 
            AND m.instalacao_id = activity_logs.installation_id
        )
    );

DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;
CREATE POLICY "System can insert logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to log activity automatically
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
DECLARE
    curr_user UUID;
    inst_id UUID;
    details_json JSONB;
BEGIN
    curr_user := auth.uid();
    
    -- Try to get installation_id from record (handle trees, plans, photos)
    -- trees/arvores: instalacao_id column? Check arvores columns. Assuming yes.
    -- tree_photos: instalacao_id
    -- planos_intervencao: instalacao_id
    
    IF (TG_OP = 'DELETE') THEN
        -- Handle naming diffs if needed. Assuming 'instalacao_id' column exists in all.
        -- If 'arvores' uses 'installation_id' or something else, this might fail.
        -- Based on standard BMAD pattern, usually 'instalacao_id'.
        inst_id := OLD.instalacao_id;
        details_json := to_jsonb(OLD);
    ELSE
        inst_id := NEW.instalacao_id;
        details_json := to_jsonb(NEW);
    END IF;

    IF inst_id IS NOT NULL THEN
        INSERT INTO public.activity_logs (
            installation_id, 
            user_id, 
            entity_type, 
            entity_id, 
            action_type, 
            details
        ) VALUES (
            inst_id,
            curr_user,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            details_json
        );
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Trees (Arvores)
DROP TRIGGER IF EXISTS on_tree_change ON public.arvores;
CREATE TRIGGER on_tree_change
    AFTER INSERT OR UPDATE OR DELETE ON public.arvores
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Trigger for Photos (tree_photos)
DROP TRIGGER IF EXISTS on_photo_change ON public.tree_photos;
CREATE TRIGGER on_photo_change
    AFTER INSERT OR UPDATE OR DELETE ON public.tree_photos
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Trigger for Plans (planos_intervencao)
DROP TRIGGER IF EXISTS on_plan_change ON public.planos_intervencao;
CREATE TRIGGER on_plan_change
    AFTER INSERT OR UPDATE OR DELETE ON public.planos_intervencao
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Function to notify team on New Tree
CREATE OR REPLACE FUNCTION public.notify_new_tree()
RETURNS TRIGGER AS $$
DECLARE
    target_user RECORD;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Notify all OTHER users in the same installation
        FOR target_user IN 
            SELECT user_id FROM public.instalacao_membros 
            WHERE instalacao_id = NEW.instalacao_id 
            AND user_id != auth.uid()
        LOOP
            INSERT INTO public.notifications (
                user_id,
                installation_id,
                type,
                title,
                message,
                action_link,
                metadata
            ) VALUES (
                target_user.user_id,
                NEW.instalacao_id,
                'INFO',
                'Nova Árvore Adicionada',
                'Uma nova árvore foi adicionada à instalação.',
                '/inventory',
                jsonb_build_object('tree_id', NEW.id)
            );
        END LOOP;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_tree_notify ON public.arvores;
CREATE TRIGGER on_new_tree_notify
    AFTER INSERT ON public.arvores
    FOR EACH ROW EXECUTE FUNCTION public.notify_new_tree();
