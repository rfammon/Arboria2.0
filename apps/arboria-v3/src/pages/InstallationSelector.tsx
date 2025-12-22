import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// import { InstallationService } from '../lib/installationService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Building2, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// import type { Installation } from '../types/installation';

export default function InstallationSelector() {
    const { installations, loading, setActiveInstallation, user } = useAuth();
    const [selecting, setSelecting] = useState(false);
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    if (!loading && !user) {
        navigate('/login', { replace: true });
        return null;
    }

    const selectInstallation = async (installationId: string) => {
        setSelecting(true);
        try {
            // Find the full installation object
            const installation = installations.find(i => i.id === installationId);

            if (!installation) {
                throw new Error('Instalação não encontrada');
            }

            // Update AuthContext state (this also updates localStorage inside the provider)
            setActiveInstallation(installation);

            toast.success('Instalação selecionada com sucesso!');
            navigate('/', { replace: true });
        } catch (error: any) {
            toast.error('Erro ao selecionar instalação');
            console.error(error);
        } finally {
            setSelecting(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando instalações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        <span className="text-blue-600 dark:text-blue-500">Arbor</span>
                        <span className="text-green-600 dark:text-green-500">IA</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">Selecione uma instalação para continuar</p>
                </div>

                {installations.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardHeader className="text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <CardTitle>Nenhuma Instalação Encontrada</CardTitle>
                            <CardDescription>
                                Você ainda não faz parte de nenhuma instalação.
                                <br />
                                Crie uma nova instalação ou peça para ser convidado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={() => navigate('/installation-settings')}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Nova Instalação
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="w-full"
                            >
                                Sair
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {installations.map((installation) => (
                                <Card
                                    key={installation.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow border-border"
                                    onClick={() => selectInstallation(installation.id)}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg text-foreground">{installation.nome}</CardTitle>
                                                {installation.descricao && (
                                                    <CardDescription className="mt-2">
                                                        {installation.descricao}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Building2 className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="h-4 w-4 mr-1" />
                                            Membro desde {new Date(installation.created_at).toLocaleDateString()}
                                        </div>
                                        <Button
                                            className="w-full mt-4"
                                            disabled={selecting}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectInstallation(installation.id);
                                            }}
                                        >
                                            {selecting ? 'Selecionando...' : 'Selecionar'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => navigate('/installation-settings')}
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Nova Instalação
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                            >
                                Sair
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
