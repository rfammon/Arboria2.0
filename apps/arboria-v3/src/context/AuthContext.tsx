import { createContext, useContext, useEffect, useState, useMemo } from 'react';
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

    const refreshInstallations = async () => {
        try {
            const data = await InstallationService.getUserInstallations();
            setInstallations(data);

            // Auto-select first if none selected
            if (data.length > 0 && !activeInstallation) {
                // Check local storage
                const storedId = localStorage.getItem('arboria_active_installation');
                const found = data.find((i: any) => i.id === storedId);
                setActiveInstallation(found || data[0]);
            }
        } catch (error) {
            console.error('Error fetching installations:', error);
        }
    };

    const fetchUserTheme = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('theme')
                .eq('id', userId)
                .single();

            if (data && !error) {
                setUserTheme(data.theme);
            }
        } catch (error) {
            console.error('Error fetching user theme:', error);
        }
    };

    const handleSetActiveInstallation = (installation: Installation) => {
        setActiveInstallation(installation);
        localStorage.setItem('arboria_active_installation', installation.id);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setInstallations([]);
        setActiveInstallation(null);
        setUserTheme(null);
        localStorage.removeItem('arboria_active_installation');
    };

    const updateUserTheme = async (theme: string) => {
        if (!session?.user?.id) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ theme })
                .eq('id', session.user.id);

            if (!error) {
                setUserTheme(theme);
            } else {
                console.error('Error updating user theme:', error);
            }
        } catch (error) {
            console.error('Error updating user theme:', error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Carrega perfis PRIMEIRO (dado estático, não depende de sessão)
                const profiles = await InstallationService.getProfiles();

                if (!isMounted) return;

                const map: Record<string, { nome: string, permissoes: string[] }> = {};
                profiles.forEach(p => map[p.id] = { nome: p.nome, permissoes: p.permissoes });

                console.log('[AuthContext] Profiles loaded:', Object.keys(map).length);
                setProfileMap(map);
                setProfilesLoaded(true);

                // 2. Carrega sessão
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                setSession(session);

                // 3. Se autenticado, carrega instalações
                if (session) {
                    await refreshInstallations();
                    await fetchUserTheme(session.user.id);
                }

            } catch (error) {
                console.error('[AuthContext] Initialization error:', error);
            } finally {
                // 4. Só seta loading=false quando TUDO estiver pronto
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        // Listener para mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!isMounted) return;

                setSession(session);

                if (session) {
                    await refreshInstallations();
                    await fetchUserTheme(session.user.id);
                } else {
                    setInstallations([]);
                    setActiveInstallation(null);
                    setUserTheme(null);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Derived values
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

    const hasPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    const value = {
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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
