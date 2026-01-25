import { useNavigate, Link } from 'react-router-dom';
import { Map, LayoutDashboard, Play, AlertTriangle, BarChart3, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceCard } from '../components/ui/service-card';
import {
  MapIllustration,
  PlansIllustration,
  AlertsIllustration,
  ReportsIllustration,
  EducationIllustration
} from '../components/illustrations/dashboard-icons';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const features = [
    {
      id: 'maps',
      title: 'Inventário e Mapas',
      description: 'Visualize e gerencie o cadastro georreferenciado de ativos',
      icon: Map,
      illustration: <MapIllustration />,
      onClick: () => navigate('/inventory?view=map'),
      colorClass: 'dark:bg-slate-900 bg-slate-50 text-slate-900 dark:text-white border border-slate-200 dark:border-transparent',
      className: 'lg:col-span-8 md:col-span-2 min-h-[320px]',
      visible: hasPermission('view_inventory') || hasPermission('manage_installation')
    },
    {
      id: 'execution',
      title: 'Minhas Tarefas',
      description: 'Acesse e execute suas ordens de serviço em campo',
      icon: Play,
      illustration: <PlansIllustration />, // Reusing as per instructions
      onClick: () => navigate('/execution'),
      colorClass: 'dark:bg-emerald-900 bg-emerald-50 text-emerald-900 dark:text-white border border-emerald-200 dark:border-transparent',
      className: 'lg:col-span-4 md:col-span-1 min-h-[320px]',
      visible: hasPermission('view_plans') || hasPermission('manage_installation')
    },
    {
      id: 'plans',
      title: 'Gestor de Planos',
      description: 'Gerencie e acompanhe todos os planos de intervenção',
      icon: LayoutDashboard,
      illustration: <PlansIllustration />,
      onClick: () => navigate('/plans'),
      colorClass: 'dark:bg-indigo-900 bg-indigo-50 text-indigo-900 dark:text-white border border-indigo-200 dark:border-transparent',
      className: 'lg:col-span-4 md:col-span-1',
      visible: hasPermission('create_plans') || hasPermission('edit_plans') || hasPermission('approve_plans')
    },
    {
      id: 'alerts',
      title: 'Central de Alertas',
      description: 'Monitore problemas e solicitações urgentes em tempo real',
      icon: AlertTriangle,
      illustration: <AlertsIllustration />,
      onClick: () => navigate('/alerts'),
      colorClass: 'dark:bg-rose-900 bg-rose-50 text-rose-900 dark:text-white border border-rose-200 dark:border-transparent',
      className: 'lg:col-span-4 md:col-span-1',
      visible: true
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Análises detalhadas',
      icon: BarChart3,
      illustration: <ReportsIllustration />,
      onClick: () => navigate('/reports'),
      colorClass: 'dark:bg-violet-900 bg-violet-50 text-violet-900 dark:text-white border border-violet-200 dark:border-transparent',
      className: 'lg:col-span-2 md:col-span-1',
      visible: hasPermission('manage_installation')
    },
    {
      id: 'education',
      title: 'Educação',
      description: 'Conteúdos técnicos',
      icon: GraduationCap,
      illustration: <EducationIllustration />,
      onClick: () => navigate('/education'),
      colorClass: 'dark:bg-sky-900 bg-sky-50 text-sky-900 dark:text-white border border-sky-200 dark:border-transparent',
      className: 'lg:col-span-2 md:col-span-1',
      visible: true
    }
  ];

  return (
    <div className="min-h-full w-full mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-500">
      <div className="px-2 py-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Dashboard <span className="text-foreground/50 mx-1">/</span> Principal
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {features
          .filter(f => f.visible)
          .map((feature) => (
            <ServiceCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              illustration={feature.illustration}
              onClick={feature.onClick}
              colorClass={feature.colorClass}
              className={feature.className}
            />
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
