import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Mail, CheckCircle, UserPlus, Send, ClipboardCheck } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';
import { PushNotificationSettings } from '../PushNotificationSettings';

export function NotificationPreferencesCard() {
    const { preferences, isLoading, togglePreference, isUpdating } = useNotificationPreferences();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    const emailTypes = [
        {
            key: 'email_enabled' as const,
            label: 'Ativar Notificações por Email',
            description: 'Receber emails para eventos importantes',
            icon: Mail,
            isMain: true,
        },
        {
            key: 'email_access_requests' as const,
            label: 'Solicitações de Acesso',
            description: 'Quando alguém solicita acesso à sua instalação',
            icon: UserPlus,
        },
        {
            key: 'email_approvals' as const,
            label: 'Aprovações e Rejeições',
            description: 'Quando suas solicitações são aprovadas ou rejeitadas',
            icon: CheckCircle,
        },
        {
            key: 'email_invites' as const,
            label: 'Convites',
            description: 'Quando você recebe um convite para uma instalação',
            icon: Send,
        },
        {
            key: 'email_task_completion' as const,
            label: 'Conclusão de Tarefas',
            description: 'Quando tarefas da sua instalação são concluídas',
            icon: ClipboardCheck,
        },
    ];

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Notificações por Email
                    </CardTitle>
                    <CardDescription>
                        Configure quais comunicações você deseja receber via email
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Main Email Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="email_enabled" className="font-semibold cursor-pointer">
                                    Notificações por Email
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Habilitar/desabilitar todos os emails
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="email_enabled"
                            checked={preferences.email_enabled}
                            onCheckedChange={() => togglePreference('email_enabled')}
                            disabled={isUpdating}
                        />
                    </div>

                    <div className={`space-y-4 ${!preferences.email_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        {emailTypes.slice(1).map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0 border-border/50">
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label htmlFor={item.key} className="font-medium cursor-pointer">
                                            {item.label}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                                <Switch
                                    id={item.key}
                                    checked={preferences[item.key]}
                                    onCheckedChange={() => togglePreference(item.key)}
                                    disabled={isUpdating}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Push Notifications - usando componente dedicado */}
            <PushNotificationSettings />
        </div>
    );
}
