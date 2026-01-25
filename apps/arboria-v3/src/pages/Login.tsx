import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, ShieldCheck, Sprout, Loader2 } from 'lucide-react';
import BackgroundCarousel from '../components/layout/BackgroundCarousel';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'signup') {
            setIsSignup(true);
        }
    }, [location.search]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success('Bem-vindo de volta!');
            navigate('/installation-selector', { replace: true });
        } catch (error: any) {
            toast.error(error.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            toast.error('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (!nome.trim()) {
            toast.error('Por favor, informe seu nome');
            return;
        }

        if (!matricula.trim()) {
            toast.error('Por favor, informe sua matrícula');
            return;
        }

        setLoading(true);

        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authData.user.id,
                        nome: nome.trim(),
                        matricula: matricula.trim(),
                    });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    toast.warning('Conta criada, mas houve erro ao salvar perfil.');
                }
            }

            toast.success('Cadastro realizado! Verifique seu email.');
            setIsSignup(false);
            setPassword('');
            setConfirmPassword('');
            setNome('');
            setMatricula('');
        } catch (error: any) {
            console.error('Signup error:', error);
            toast.error(error.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
            {/* Left Side (Hero) */}
            <div className="hidden lg:flex relative bg-slate-950 overflow-hidden h-full flex-col justify-end">
                <BackgroundCarousel />
                
                <div className="relative z-10 flex flex-col justify-end p-12 w-full">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="ArboIA Logo" className="w-12 h-12" />
                            <span className="text-3xl font-black tracking-tighter">
                                <span className="text-emerald-500">Arbo</span>
                                <span className="text-blue-600">IA</span>
                            </span>
                        </div>
                        
                        <h2 className="text-4xl font-bold text-white leading-tight max-w-md">
                            Gestão inteligente de ecossistemas urbanos e industriais.
                        </h2>

                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex items-center gap-2 text-slate-300">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium">100% Digital & Seguro</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Sprout className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium">Sustentabilidade Ativa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <img src="/logo.png" alt="ArboIA Logo" className="w-10 h-10" />
                            <span className="text-2xl font-black tracking-tighter">
                                <span className="text-emerald-500">Arbo</span>
                                <span className="text-blue-600">IA</span>
                            </span>
                        </div>
                        
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {isSignup ? "Criar nova conta" : "Bem-vindo de volta"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Acesse a plataforma ArboIA para gerenciar seus ativos ambientais.
                        </p>
                    </div>

                    <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            {isSignup && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome Completo</Label>
                                        <Input
                                            id="nome"
                                            placeholder="Seu nome"
                                            required
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="matricula" className="text-xs font-bold uppercase tracking-wider text-slate-500">Matrícula</Label>
                                        <Input
                                            id="matricula"
                                            placeholder="Sua matrícula"
                                            required
                                            value={matricula}
                                            onChange={(e) => setMatricula(e.target.value)}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 h-12 rounded-xl"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 h-12 rounded-xl"
                                />
                            </div>

                            {isSignup && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmar Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 h-12 rounded-xl"
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 group transition-all duration-300"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignup ? "Criar Conta" : "Entrar no Painel"}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            {isSignup ? "Já tem uma conta? Entre agora" : "Não tem conta? Cadastre-se"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
