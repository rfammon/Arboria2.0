import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { InstallationService } from '../lib/installationService';
import type { Installation } from '../types/installation';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    installations: Installation[];
    activeInstallation: Installation | null;
    setActiveInstallation: (installation: Installation) => void;
    refreshInstallations: () => Promise<void>;
    userDisplayName: string;
    activeProfileNames: string;
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    userTheme: string | null;
    updateUserTheme: (theme: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    installations: [],
    activeInstallation: null,
    setActiveInstallation: () => { },
    refreshInstallations: async () => { },
    userDisplayName: '',
    activeProfileNames: '',
    permissions: [],
    hasPermission: () => false,
    userTheme: null,
    updateUserTheme: async () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [activeInstallation, setActiveInstallation] = useState<Installation | null>(null);
    const [userTheme, setUserTheme] = useState<string | null>(null);
    const [profileMap, setProfileMap] = useState<Record<string, { nome: string, permissoes: string[] }>>({});
    const [profilesLoaded, setProfilesLoaded] = useState(false);

    // ─── Helper Functions (stable references via useCallback) ───────────

    const refreshInstallations = useCallback(async () => {
        try {
            const data = await InstallationService.getUserInstallations();
            setInstallations(data);

            // Auto-select first if none selected
            if (data.length > 0) {
                const storedId = localStorage.getItem('arboria_active_installation');
                const found = data.find((i: any) => i.id === storedId);
                setActiveInstallation(prev => prev || found || data[0]);
            }
        } catch (error) {
            console.error('[AuthContext] Error fetching installations:', error);
        }
    }, []);

    const fetchUserTheme = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('theme')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('[AuthContext] Error fetching theme:', error);
            } else if (data) {
                setUserTheme(data.theme);
            }
        } catch (error) {
            console.error('[AuthContext] Unexpected error fetching user theme:', error);
        }
    }, []);

    const handleSetActiveInstallation = useCallback((installation: Installation) => {
        setActiveInstallation(installation);
        localStorage.setItem('arboria_active_installation', installation.id);
    }, []);

    const signOut = useCallback(async () => {
        try {
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Sign out timeout')), 2000)
                )
            ]).catch(err => {
                console.warn('[AuthContext] signOut timed out or failed:', err);
            });
        } catch (error) {
            console.error('[AuthContext] Error during signOut:', error);
        } finally {
            // Local state cleanup — Supabase handles its own token removal
            setSession(null);
            setInstallations([]);
            setActiveInstallation(null);
            setUserTheme(null);
            setProfileMap({});
            setProfilesLoaded(false);
            localStorage.removeItem('arboria_active_installation');
            window.location.hash = '#/login';
        }
    }, []);

    const updateUserTheme = useCallback(async (theme: string) => {
        if (!session?.user?.id) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ theme })
                .eq('id', session.user.id);

            if (!error) {
                setUserTheme(theme);
            } else {
                console.error('[AuthContext] Error updating user theme:', error);
            }
        } catch (error) {
            console.error('[AuthContext] Error updating user theme:', error);
        }
    }, [session?.user?.id]);

    // ─── Effect 1: Auth Subscription (Single Source of Truth) ───────────
    // Supabase manages its own token persistence. We only listen to state changes.

    useEffect(() => {
        console.log('[AuthContext] Initializing auth subscription...');

        // Get the initial session from Supabase's internal storage
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthContext] Initial session:', session ? 'found' : 'none');
            setSession(session);
            setLoading(false);
        });

        // Subscribe to auth state changes — this is the ONLY source of truth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                console.log('[AuthContext] Auth state changed:', _event, session ? 'session' : 'no session');
                setSession(session);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // ─── Effect 2: Data Loading (Decoupled, Non-blocking) ──────────────
    // Loads user data when session changes. Failures are non-fatal (graceful degradation).

    useEffect(() => {
        const userId = session?.user?.id;

        if (!userId) {
            // User logged out — clear all data
            setInstallations([]);
            setActiveInstallation(null);
            setUserTheme(null);
            setProfileMap({});
            setProfilesLoaded(false);
            return;
        }

        console.log('[AuthContext] Loading user data for:', userId);

        // Load profiles (non-blocking)
        InstallationService.getProfiles()
            .then(profiles => {
                const map: Record<string, { nome: string, permissoes: string[] }> = {};
                profiles.forEach(p => map[p.id] = { nome: p.nome, permissoes: p.permissoes });
                setProfileMap(map);
                setProfilesLoaded(true);
            })
            .catch(err => {
                console.warn('[AuthContext] Failed to load profiles (non-critical):', err);
            });

        // Load installations (non-blocking)
        refreshInstallations().catch(err => {
            console.warn('[AuthContext] Failed to load installations (non-critical):', err);
        });

        // Load theme (non-blocking)
        fetchUserTheme(userId).catch(err => {
            console.warn('[AuthContext] Failed to load theme (non-critical):', err);
        });

    }, [session?.user?.id, refreshInstallations, fetchUserTheme]);

    // ─── Derived Values ────────────────────────────────────────────────

    const userDisplayName = useMemo(() => {
        if (!session?.user) return '';
        return session.user.user_metadata?.full_name || session.user.email || 'Usuário';
    }, [session]);

    const activeProfileNames = useMemo(() => {
        if (!activeInstallation || !profilesLoaded || !activeInstallation.membership) return '';
        return activeInstallation.membership.perfis
            .map((pid: string) => profileMap[pid]?.nome)
            .filter(Boolean)
            .join(', ');
    }, [activeInstallation, profileMap, profilesLoaded]);

    const permissions = useMemo(() => {
        if (!activeInstallation || !profilesLoaded || !activeInstallation.membership) return [];
        const perms = new Set<string>();
        activeInstallation.membership.perfis.forEach((pid: string) => {
            profileMap[pid]?.permissoes.forEach(p => perms.add(p));
        });
        return Array.from(perms);
    }, [activeInstallation, profileMap, profilesLoaded]);

    const hasPermission = useCallback((permission: string) => {
        return permissions.includes(permission);
    }, [permissions]);

    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        loading,
        signOut,
        installations,
        activeInstallation,
        setActiveInstallation: handleSetActiveInstallation,
        refreshInstallations,
        userDisplayName,
        activeProfileNames,
        permissions,
        hasPermission,
        userTheme,
        updateUserTheme
    }), [
        session, loading, signOut, installations, activeInstallation,
        handleSetActiveInstallation, refreshInstallations, userDisplayName,
        activeProfileNames, permissions, hasPermission, userTheme, updateUserTheme
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
