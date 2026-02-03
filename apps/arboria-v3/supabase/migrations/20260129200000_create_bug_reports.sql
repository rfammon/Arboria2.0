-- Migration: Create bug_reports table
-- Purpose: Store user-submitted bug reports from the app

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    installation_id UUID REFERENCES public.installations(id) ON DELETE SET NULL,
    
    -- Bug details
    bug_type TEXT NOT NULL CHECK (bug_type IN ('crash', 'ui', 'sync', 'map', 'login', 'performance', 'other')),
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    contact_email TEXT,
    
    -- Automatic metadata
    app_version TEXT,
    platform TEXT,
    user_agent TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can insert their own bug reports
CREATE POLICY "Users can create bug reports"
    ON public.bug_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own bug reports
CREATE POLICY "Users can view own bug reports"
    ON public.bug_reports
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Managers/Admins can view all bug reports (check via profiles role)
CREATE POLICY "Admins can view all bug reports"
    ON public.bug_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Admins can update bug reports (for status changes)
CREATE POLICY "Admins can update bug reports"
    ON public.bug_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_bug_reports_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON public.bug_reports TO authenticated;
GRANT UPDATE ON public.bug_reports TO authenticated;
