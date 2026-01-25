import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { InterventionPlan } from '../../types/plan';
import { 
  extractScheduleDate 
} from '../../lib/planUtils';

interface ForestryDashboardHeroProps {
  plans: InterventionPlan[];
}

const RISK_COLORS: Record<string, string> = {
  'Crítico': '#f43f5e',
  'Alto': '#e11d48',
  'Médio': '#f59e0b',
  'Baixo': '#10b981',
  'Não Classificado': '#94a3b8',
};

function getWorkloadData(plans: InterventionPlan[]) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const trend: { year: number; month: number; label: string; days: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trend.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: months[d.getMonth()],
      days: 0
    });
  }

  plans.forEach(plan => {
    const dateStr = extractScheduleDate(plan.schedule) || plan.created_at;
    if (!dateStr) return;
    
    const d = new Date(dateStr);
    const m = d.getMonth();
    const y = d.getFullYear();
    
    const entry = trend.find(t => t.month === m && t.year === y);
    if (entry) {
      entry.days += plan.durations?.execution || 1;
    }
  });

  return trend.map(t => ({ month: t.label, days: t.days }));
}

function getRiskData(plans: InterventionPlan[]) {
  const counts: Record<string, number> = {
    'Crítico': 0,
    'Alto': 0,
    'Médio': 0,
    'Baixo': 0,
    'Não Classificado': 0
  };

  plans.forEach(plan => {
    const risk = plan.tree?.risklevel || 'Não Classificado';
    counts[risk] = (counts[risk] || 0) + 1;
  });

  return Object.entries(counts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: RISK_COLORS[name] || RISK_COLORS['Não Classificado']
    }))
    .sort((a, b) => {
      const order = ['Crítico', 'Alto', 'Médio', 'Baixo', 'Não Classificado'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
}

export function ForestryDashboardHero({ plans }: ForestryDashboardHeroProps) {
  const workloadData = getWorkloadData(plans);
  const riskData = getRiskData(plans);
  const hasData = plans.length > 0;

  const tooltipStyles = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Effort Prediction Chart */}
      <Card className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xl overflow-hidden group">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            Previsão de Esforço (Dias/Homem)
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-normal ml-auto">Últimos 6 meses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={workloadData}>
              <defs>
                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="currentColor" 
                className="text-slate-200 dark:text-white/5" 
              />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 12 }} 
                className="text-slate-500 dark:text-white/40"
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 12 }} 
                className="text-slate-500 dark:text-white/40"
                label={{ value: 'Dias Estimados', angle: -90, position: 'insideLeft', offset: 0, fill: 'currentColor', fontSize: 10, className: 'text-slate-400' }}
              />
              <Tooltip 
                contentStyle={tooltipStyles}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number) => [`${value} dias de trabalho programados`, 'Esforço']}
              />
              <Area 
                type="monotone" 
                dataKey="days" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDays)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Mitigation Chart */}
      <Card className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xl overflow-hidden group">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            Mitigação de Risco
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-normal ml-auto">Prioridade</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {hasData ? (
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipStyles}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right" 
                  layout="vertical"
                  formatter={(value) => <span className="text-sm font-medium text-slate-600 dark:text-white/70">{value}</span>}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-white/40 text-sm">
                Nenhum dado disponível
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
