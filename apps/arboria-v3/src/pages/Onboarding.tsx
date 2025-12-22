import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { InstallationService } from '../lib/installationService';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Onboarding() {
    const [name, setName] = useState('');
    const [type, setType] = useState('Planta Industrial');
    const [loading, setLoading] = useState(false);
    const { refreshInstallations, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        navigate('/login', { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await InstallationService.createInstallation({
                nome: name,
                // @ts-ignore
                tipo: type
            });
            await refreshInstallations();
            toast.success('Instalação criada com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar instalação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Bem-vindo ao ArborIA</CardTitle>
                    <CardDescription>Para começar, crie sua primeira instalação (ambiente de trabalho).</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Instalação</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Fábrica Matriz, Parque Central..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="Planta Industrial">Planta Industrial</option>
                                <option value="Campus Corporativo">Campus Corporativo</option>
                                <option value="Município">Município</option>
                                <option value="Parque">Parque</option>
                                <option value="Condomínio">Condomínio</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Instalação'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
