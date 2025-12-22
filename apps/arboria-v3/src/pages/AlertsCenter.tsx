import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertTriangle, CheckCircle, X, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskAlert {
    id: string;
    task_id: string;
    user_id: string;
    alert_type: string;
    message: string;
    resolved: boolean;
    created_at: string;
    user: {
        full_name: string;
        email: string;
    };
    task?: {
        intervention_type: string;
    };
    plan?: {
        id: string;
        title: string;
    };
}

export default function AlertsCenter() {
    const { activeInstallation } = useAuth();
    const navigate = useNavigate();

    const [filterMode, setFilterMode] = useState<'all' | 'unresolved'>('unresolved');

    // Filters state
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [reporterFilter, setReporterFilter] = useState('all');

    const { data: alerts, refetch } = useQuery({
        queryKey: ['alerts', activeInstallation?.id],
        queryFn: async () => {
            if (!activeInstallation?.id) return [];

            const { data, error } = await supabase
                .rpc('get_installation_alerts', { p_instalacao_id: activeInstallation.id });

            if (error) throw error;

            // Map RPC struct to TaskAlert interface
            return (data || []).map((a: any) => ({
                id: a.id,
                task_id: a.task_id,
                user_id: a.user_id,
                alert_type: a.alert_type,
                message: a.message,
                resolved: a.resolved,
                created_at: a.created_at,
                user: { full_name: a.reporter_name, email: a.reporter_email },
                task: { intervention_type: a.task_type },
                plan: a.plan_id ? { id: a.plan_id, title: a.plan_title } : undefined
            })) as TaskAlert[];
        },
        enabled: !!activeInstallation?.id
    });

    const handleResolve = async (id: string) => {
        const { error } = await supabase
            .from('task_alerts')
            .update({
                resolved: true,
                resolved_at: new Date().toISOString(),
                resolved_by: (await supabase.auth.getUser()).data.user?.id
            })
            .eq('id', id);

        if (!error) refetch();
    };

    // Derived unique values for filters
    const uniqueTypes = Array.from(new Set(alerts?.map(a => a.alert_type) || [])).sort();
    const uniqueReporters = Array.from(new Set(alerts?.map(a => a.user_id) || [])).map(id => {
        const alert = alerts?.find(a => a.user_id === id);
        return { id, name: alert?.user.full_name || 'Desconhecido' };
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Filter Logic
    const alertTypeLabels: Record<string, string> = {
        'SOS': 'SOS - Emergência',
        'HELP': 'Ajuda',
        'EQUIPMENT_FAILURE': 'Falha de Equipamento',
        'SAFETY_ISSUE': 'Segurança',
        'BLOCKAGE': 'Bloqueio',
        'OTHER': 'Outro',
        'ENVIRONMENTAL': 'Ambiental',
        'TECHNICAL': 'Técnico',
        'OPERATIONAL': 'Operacional',
        'ACCIDENT': 'Acidente'
    };

    const getAlertLabel = (type: string) => alertTypeLabels[type] || type;

    const filteredAlerts = alerts?.filter(alert => {
        // Tab Filter
        if (filterMode === 'unresolved' && alert.resolved) return false;

        // Advanced Filters (only for 'all' tab or if user wants to filter unresolved too? Let's allow for both, but UI focused on 'all')
        if (filterMode === 'all') {
            if (dateFilter && !alert.created_at.startsWith(dateFilter)) return false;
            if (typeFilter !== 'all' && alert.alert_type !== typeFilter) return false;
            if (reporterFilter !== 'all' && alert.user_id !== reporterFilter) return false;
        }

        return true;
    });

    const resetFilters = () => {
        setDateFilter('');
        setTypeFilter('all');
        setReporterFilter('all');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Central de Alertas</h1>
                    <p className="text-muted-foreground">Monitore e resolva problemas reportados em campo.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterMode === 'unresolved' ? 'default' : 'outline'}
                        onClick={() => setFilterMode('unresolved')}
                    >
                        Pendentes
                    </Button>
                    <Button
                        variant={filterMode === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilterMode('all')}
                    >
                        Todos
                    </Button>
                </div>
            </div>

            {/* Filters Bar - Only in 'all' mode */}
            {filterMode === 'all' && (
                <div className="bg-muted/40 p-4 rounded-lg border flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                        <Filter className="w-4 h-4" /> Filtros:
                    </div>

                    <div className="w-full sm:w-auto min-w-[150px]">
                        <label className="text-xs mb-1 block text-muted-foreground">Data</label>
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    <div className="w-full sm:w-auto min-w-[180px]">
                        <label className="text-xs mb-1 block text-muted-foreground">Tipo de Alerta</label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Todos os tipos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                {uniqueTypes.map(type => (
                                    <SelectItem key={type} value={type}>{getAlertLabel(type)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-auto min-w-[200px]">
                        <label className="text-xs mb-1 block text-muted-foreground">Executante</label>
                        <Select value={reporterFilter} onValueChange={setReporterFilter}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Todos os executantes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os executantes</SelectItem>
                                {uniqueReporters.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(dateFilter || typeFilter !== 'all' || reporterFilter !== 'all') && (
                        <Button variant="ghost" size="icon" onClick={resetFilters} className="mb-0.5">
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            <div className="grid gap-4">
                {filteredAlerts?.map(alert => (
                    <Card key={alert.id} className={alert.resolved ? 'opacity-70' : 'border-destructive/50'}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-2 items-center">
                                    <AlertTriangle className={`h-5 w-5 ${alert.resolved ? 'text-green-600' : 'text-destructive'}`} />
                                    <div>
                                        <CardTitle className="text-base">{getAlertLabel(alert.alert_type)}</CardTitle>
                                        <CardDescription>
                                            Reportado por {alert.user?.full_name || 'Desconhecido'} • {format(new Date(alert.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant={alert.resolved ? 'outline' : 'destructive'}>
                                    {alert.resolved ? 'Resolvido' : 'Pendente'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm border-l-2 border-muted pl-4 py-2 italic mb-4">
                                "{alert.message}"
                            </p>

                            <div className="flex justify-between items-center bg-muted/30 p-2 rounded text-xs text-muted-foreground">
                                <div className="flex flex-col gap-1">
                                    <span>Tarefa: {alert.task?.intervention_type || 'Geral'}</span>
                                    {alert.plan && (
                                        <button
                                            onClick={() => navigate(`/plans?planId=${alert.plan?.id}`)}
                                            className="text-[10px] text-muted-foreground/80 hover:text-primary hover:underline text-left"
                                        >
                                            Plano: {alert.plan.title}
                                        </button>
                                    )}
                                </div>
                                {!alert.resolved && (
                                    <Button size="sm" variant="secondary" onClick={() => handleResolve(alert.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Marcar como Resolvido
                                    </Button>
                                )}
                                {alert.resolved && (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircle className="w-4 h-4 mr-1" /> Resolvido
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!alerts && (
                <div className="text-center py-10 text-muted-foreground">Carregando...</div>
            )}

            {alerts && filteredAlerts?.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhum alerta encontrado com os filtros atuais.</p>
                </div>
            )}
        </div>
    );
}
