import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Trees } from 'lucide-react';
import React from 'react';

// Define SelectContext
const SelectContext = React.createContext<{
    value: string;
    onValueChange?: (value: string) => void;
}>({ value: '' });

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

    // Check for query params
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
            if (error.message?.includes('fetch') || error.message?.includes('CORS')) {
                toast.error('Erro de conexão. Verifique sua intenet.');
            } else {
                toast.error(error.message || 'Erro ao realizar cadastro');
            }
        } finally {
            setLoading(false);
        }
    };

    // Force light mode styles by avoiding bg-background and text-foreground variables
    // Using explicit colors (white, slate-*, emerald-*)
    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Soft Premium Background Decorators */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
            <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />

            {/* Header Section with Brand */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-[360px] space-y-6">
                    <div className="text-center space-y-2">
                        <div className="h-20 w-20 bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-900/20 mb-8 rotate-3 transform transition-transform hover:rotate-0 duration-300">
                            <Trees className="h-10 w-10 text-white drop-shadow-md" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-foreground font-display">
                            Arbor<span className="text-primary italic">IA</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium opacity-80 italic">
                            Ecossistemas Urbanos Gestão Inteligente
                        </p>
                    </div>

                    <div className="bg-card/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[var(--shadow-deep)] p-8 space-y-8 border border-white/10 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />

                        {/* Toggle Switch */}
                        <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-white/5 shadow-inner relative z-10">
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="nome" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nome</Label>
                                        <Input
                                            id="nome"
                                            placeholder="Seu nome"
                                            required
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            className="bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 h-12 rounded-xl border-2 focus:border-green-500/50 focus:ring-0 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="matricula" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Matrícula</Label>
                                        <Input
                                            id="matricula"
                                            placeholder="00000"
                                            required
                                            value={matricula}
                                            onChange={(e) => setMatricula(e.target.value)}
                                            className="bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 h-12 rounded-xl border-2 focus:border-green-500/50 focus:ring-0 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 h-12 rounded-xl border-2 focus:border-green-500/50 focus:ring-0 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 h-12 rounded-xl border-2 focus:border-green-500/50 focus:ring-0 transition-all font-medium"
                                />
                            </div>

                            {isSignup && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Confirmar Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 h-12 rounded-xl border-2 focus:border-green-500/50 focus:ring-0 transition-all font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 relative z-10">
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
                                        {!loading && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
                    <Link to="/terms" className="hover:text-slate-600 transition-colors">Termos de Uso</Link>
                    <span>•</span>
                    <Link to="/privacy" className="hover:text-slate-600 transition-colors">Política de Privacidade</Link>
                </div>
            </div>
        </div>
        </div >
    );
}
