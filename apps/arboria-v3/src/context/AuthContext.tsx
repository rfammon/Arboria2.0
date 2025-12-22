import { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                refreshInstallations();
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                refreshInstallations();
                fetchUserTheme(session.user.id);
            } else {
                setInstallations([]);
                setActiveInstallation(null);
                setUserTheme(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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
        } finally {
            setLoading(false);
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

    const fetchUserTheme = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
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

    const updateUserTheme = async (theme: string) => {
        if (!session?.user?.id) return;

        try {
            const { error } = await supabase
                .from('profiles')
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

    const [profileMap, setProfileMap] = useState<Record<string, { nome: string, permissoes: string[] }>>({});

    useEffect(() => {
        // Load profiles ref table
        InstallationService.getProfiles().then(profiles => {
            const map: Record<string, { nome: string, permissoes: string[] }> = {};
            profiles.forEach(p => map[p.id] = { nome: p.nome, permissoes: p.permissoes });
            setProfileMap(map);
        }).catch(console.error);
    }, []);

    const userDisplayName = session?.user?.email || 'Usuário';

    const activeMember = activeInstallation?.membership;

    // Calculate effective permissions
    const permissions = activeMember?.perfis?.reduce((acc: string[], pid: string) => {
        const profile = profileMap[pid];
        return profile ? [...acc, ...profile.permissoes] : acc;
    }, []) || [];

    const activeProfileNames = activeMember?.perfis
        ?.map((pid: string) => profileMap[pid]?.nome)
        .filter(Boolean)
        .join(', ') || 'Membro';

    const hasPermission = (permission: string) => {
        // 'global_access' (Mestre) bypasses checks
        if (permissions.includes('global_access')) return true;
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

