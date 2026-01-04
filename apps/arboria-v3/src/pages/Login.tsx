import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Trees } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Soft Premium Background Decorators */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
            <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="text-center space-y-3">
                        <div className="h-20 w-20 bg-gradient-to-br from-primary to-emerald-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 mb-6 rotate-3 transform transition-transform hover:rotate-0 duration-300">
                            <Trees className="h-10 w-10 text-primary-foreground drop-shadow-md" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-foreground font-display">
                            Arbor<span className="text-primary italic">IA</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium opacity-80 italic">
                            Ecossistemas Urbanos Gestão Inteligente
                        </p>
                    </div>

                    <div className="bg-card/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[var(--shadow-deep)] p-8 space-y-8 border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />

                        {/* Toggle Switch */}
                        <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-white/5 shadow-inner relative z-10 font-bold">
                            <button
                                type="button"
                                onClick={() => setIsSignup(false)}
                                className={cn(
                                    "flex-1 rounded-xl py-3 text-sm transition-all duration-300",
                                    !isSignup
                                        ? "bg-background text-primary shadow-lg scale-105"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Entrar
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSignup(true)}
                                className={cn(
                                    "flex-1 rounded-xl py-3 text-sm transition-all duration-300",
                                    isSignup
                                        ? "bg-background text-primary shadow-lg scale-105"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Criar Conta
                            </button>
                        </div>

                        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                {isSignup && (
                                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="nome" className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Nome</Label>
                                            <Input
                                                id="nome"
                                                placeholder="Seu nome"
                                                required
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                className="bg-muted/40 border-none shadow-inner h-12 rounded-xl focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="matricula" className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Matrícula</Label>
                                            <Input
                                                id="matricula"
                                                placeholder="00000"
                                                required
                                                value={matricula}
                                                onChange={(e) => setMatricula(e.target.value)}
                                                className="bg-muted/40 border-none shadow-inner h-12 rounded-xl focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Email Corporativo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-muted/40 border-none shadow-inner h-12 rounded-xl focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-muted/40 border-none shadow-inner h-12 rounded-xl focus:ring-primary/20"
                                    />
                                </div>

                                {isSignup && (
                                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Confirmar Senha</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-muted/40 border-none shadow-inner h-12 rounded-xl focus:ring-primary/20"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all rounded-2xl shadow-xl shadow-primary/20 text-primary-foreground group"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            {isSignup ? 'Começar Jornada' : 'Entrar no Sistema'}
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        <Link to="/terms" className="hover:text-primary transition-colors">Termos</Link>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="opacity-50">© 2024 ArborIA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
