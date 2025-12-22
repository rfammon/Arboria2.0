
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLog {
    id: string;
    entity_type: string;
    entity_id: string;
    action_type: 'CREATE' | 'UPDATE' | 'DELETE';
    details: Record<string, unknown> | null;
    created_at: string;
    user_id: string;
    user_email?: string; // Fetched separately or joined
}

export default function ActivityHistory() {
    const { activeInstallation } = useAuth();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeInstallation) {
            fetchLogs();
        }
    }, [activeInstallation]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Join with profiles if strictly necessary, but profiles table might not serve auth.users data directly everywhere
            // Simple fetch for now
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('installation_id', activeInstallation?.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data as ActivityLog[]);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-green-600 bg-green-50';
            case 'UPDATE': return 'text-blue-600 bg-blue-50';
            case 'DELETE': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600';
        }
    };

    const getEntityName = (log: ActivityLog) => {
        // Try to be smart about entity name
        const d = log.details as Record<string, any> | null; // Cast for now or define stricter type
        return d?.especie || d?.nome || d?.filename || log.entity_type;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Histórico de Atividades</h2>
                <p className="text-muted-foreground">Registro de ações na instalação {activeInstallation?.nome}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Últimas Atividades</CardTitle>
                    <CardDescription>Mostrando as 50 ações mais recentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            Nenhuma atividade registrada ainda.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action_type)}`}>
                                                {log.action_type}
                                            </span>
                                            <span className="font-medium text-sm text-gray-900">
                                                {log.entity_type}: {getEntityName(log)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Usuário: {log.user_id}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                        {format(new Date(log.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
