import { useNavigate, Link } from 'react-router-dom';
import { Map, BarChart3, GraduationCap, LayoutDashboard, Play, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

import { useAuth } from '../context/AuthContext';

export default function DashboardHome() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    const features = [
        {
            id: 'plans',
            title: 'Gestor de Planos',
            description: 'Gerencie e acompanhe todos os seus planos de intervenção',
            icon: LayoutDashboard,
            action: () => navigate('/plans'),
            btnText: 'Gerenciar Planos',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100'
        },
        {
            id: 'execution',
            title: 'Minhas Tarefas',
            description: 'Acesse e execute suas ordens de serviço em campo',
            icon: Play,
            action: () => navigate('/execution'),
            btnText: 'Iniciar Execução',
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            id: 'alerts',
            title: 'Central de Alertas',
            description: 'Monitore problemas e solicitações urgentes',
            icon: AlertTriangle, // Need to add import
            action: () => navigate('/alerts'),
            btnText: 'Ver Alertas',
            color: 'text-amber-600',
            bgColor: 'bg-amber-100'
        },
        {
            id: 'maps',
            title: 'Inventário e Mapas',
            description: 'Visualize e gerencie o cadastro georreferenciado',
            icon: Map,
            action: () => navigate('/inventory?view=map'),
            btnText: 'Acessar Mapa',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            id: 'reports',
            title: 'Relatórios',
            description: 'Gere análises e documentos para tomada de decisão',
            icon: BarChart3,
            action: () => navigate('/reports'),
            btnText: 'Ver Relatórios',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            id: 'education',
            title: 'Educação',
            description: 'Conteúdos técnicos sobre manejo e segurança',
            icon: GraduationCap,
            action: () => navigate('/education'),
            btnText: 'Acessar Conteúdos',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4 py-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground transition-all">
                    Bem-vindo ao <span className="text-blue-600 dark:text-blue-400">Arbor</span><span className="text-green-600 dark:text-green-400">IA</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    Sua Plataforma de Manejo Integrado de Árvores
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.filter(feature => {
                    if (feature.id === 'plans') return hasPermission('create_plans') || hasPermission('edit_plans') || hasPermission('approve_plans');
                    if (feature.id === 'execution') return hasPermission('view_plans') || hasPermission('manage_installation');
                    if (feature.id === 'maps') return hasPermission('view_inventory') || hasPermission('manage_installation');
                    if (feature.id === 'reports') return hasPermission('manage_installation');
                    // Alerts and Education are visible to all (or add specific checks if needed)
                    return true;
                }).map((feature) => (
                    <Card key={feature.id} className="hover:shadow-[var(--shadow-deep)] hover:-translate-y-1 transition-all duration-300 border-none group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" style={{ color: 'currentColor' }} />
                        <CardHeader className="space-y-1">
                            <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CardDescription className="text-base">
                                {feature.description}
                            </CardDescription>
                            <Button
                                onClick={feature.action}
                                className="w-full shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
                                variant="default"
                            >
                                {feature.btnText}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <footer className="mt-12 text-center text-sm text-gray-500 pb-8">
                <div className="flex justify-center gap-6">
                    <Link to="/terms" className="hover:text-gray-900 transition-colors">Termos de Uso</Link>
                    <Link to="/privacy" className="hover:text-gray-900 transition-colors">Política de Privacidade</Link>
                </div>
            </footer>
        </div>
    );
}
