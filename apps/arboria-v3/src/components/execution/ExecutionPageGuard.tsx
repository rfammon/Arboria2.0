import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Simple check for now: 
// 1. Must be authenticated
// 2. Must be member of active installation
// 3. (Optional) Check specific role 'Executante' if we fetch profiles
// For MVP, just being in the installation is enough to "Access" it, 
// and RLS handles the rest. But the Story says "Solicitar Acesso".
// We will implement a check that verifies if the user has "Executante" profile in the installation.

export function ExecutionPageGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, activeInstallation } = useAuth();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAccess = async () => {
            if (!user || !activeInstallation) {
                setHasAccess(false);
                return;
            }

            // Check if user has 'Executante' profile in this installation
            // We need to query 'instalacao_membros' and 'perfis'
            try {
                // RPC check removed as it's not implemented yet

                const { data: memberData, error: memberError } = await supabase
                    .from('instalacao_membros')
                    .select('perfis')
                    .eq('user_id', user.id)
                    .eq('instalacao_id', activeInstallation.id)
                    .maybeSingle();

                if (memberError || !memberData) {
                    console.error('Error fetching member data:', memberError);
                    setHasAccess(false);
                    return;
                }

                // Check if any of their profiles is named 'Executante'
                if (!memberData.perfis || memberData.perfis.length === 0) {
                    setHasAccess(false);
                    return;
                }

                const { data: perfisData, error: perfisError } = await supabase
                    .from('perfis')
                    .select('nome')
                    .in('id', memberData.perfis);

                if (perfisError) {
                    console.error('Error fetching profiles:', perfisError);
                    setHasAccess(false);
                    return;
                }

                const isExecutante = perfisData?.some((p: { nome: string }) => p.nome === 'Executante' || p.nome === 'Gestor' || p.nome === 'Mestre');
                // Gestor/Mestre usually implies Executante access too? Or at least view.

                setHasAccess(isExecutante || false);

            } catch (err) {
                console.error(err);
                setHasAccess(false);
            }
        };

        if (!loading) {
            checkAccess();
        }
    }, [user, activeInstallation, loading]);

    if (loading || hasAccess === null) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!activeInstallation) {
        return <Navigate to="/welcome" replace />;
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center p-4">
                <h2 className="text-xl font-bold text-red-600">Acesso Negado</h2>
                <p className="text-muted-foreground">
                    Você não possui o perfil de 'Executante' nesta instalação.
                    Solicite acesso ao gestor.
                </p>
                <div className="flex gap-2">
                    {/* Button to request access (Story 1.1) */}
                    {/* For now just back */}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
