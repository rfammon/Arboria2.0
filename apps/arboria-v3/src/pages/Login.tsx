import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
        <div className="min-h-screen flex flex-col bg-[#f0fdf4]">
            {/* Background Decorator */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from- emerald-100 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Header Section with Brand */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-[360px] space-y-6">
                    <div className="text-center space-y-2">
                        <div className="h-20 w-20 bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-900/20 mb-8 rotate-3 transform transition-transform hover:rotate-0 duration-300">
                            <Trees className="h-10 w-10 text-white drop-shadow-md" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 font-display">
                            Arbor<span className="text-green-600">IA</span>
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Gestão inteligente para áreas verdes
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 space-y-6 border border-slate-100">
                        {/* Toggle Switch */}
                        <div className="flex rounded-2xl bg-slate-100 p-1.5">
                            <button
                                onClick={() => setIsSignup(false)}
                                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${!isSignup
                                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Entrar
                            </button>
                            <button
                                onClick={() => setIsSignup(true)}
                                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${isSignup
                                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Criar Conta
                            </button>
                        </div>

                        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
                            <div className="space-y-4">
                                {isSignup && (
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

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-green-600/30 text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            {isSignup ? 'Começar' : 'Entrar'}
                                            {!loading && <ArrowRight className="ml-2 h-5 w-5 opacity-90" />}
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
        </div>
    );
}
