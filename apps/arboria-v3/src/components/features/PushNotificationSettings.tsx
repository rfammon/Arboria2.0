import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Bell, BellOff, Settings, AlertTriangle } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';

type PermissionStatus = 'granted' | 'denied' | 'prompt';

interface NotificationPreferences {
    push_task_completion: boolean;
    push_plan_completion: boolean;
    push_invite_accepted: boolean;
    push_app_update: boolean;
    push_alerts: boolean;
    // Keeping some UI-only or legacy ones if needed, but primarily aligning with backend
    task_assigned: boolean;
    plan_updated: boolean;
    comment_added: boolean;
    system_update: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    push_task_completion: true,
    push_plan_completion: true,
    push_invite_accepted: true,
    push_app_update: true,
    push_alerts: true,
    task_assigned: true,
    plan_updated: true,
    comment_added: true,
    system_update: true,
};

export function PushNotificationSettings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [enabled, setEnabled] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(false);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        const platform = Capacitor.getPlatform();
        setIsNative(platform === 'android' || platform === 'ios');

        if (isNative) {
            checkPermissionStatus();
            loadPreferences();
        }
    }, [isNative]);

    const checkPermissionStatus = async () => {
        try {
            const result = await PushNotifications.checkPermissions();
            setPermissionStatus(result.receive as PermissionStatus);
            setEnabled(result.receive === 'granted');
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    };

    const loadPreferences = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('device_tokens')
                .select('notification_preferences, enabled')
                .eq('user_id', user.id)
                .eq('platform', Capacitor.getPlatform())
                .single();

            if (data && !error) {
                setPreferences(data.notification_preferences || DEFAULT_PREFERENCES);
                setEnabled(data.enabled ?? false);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const handleTogglePush = async (checked: boolean) => {
        if (!isNative) return;

        setLoading(true);
        try {
            if (checked) {
                // Request permissions
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive === 'granted') {
                    // Register for push
                    await PushNotifications.register();
                    setPermissionStatus('granted');
                    setEnabled(true);

                    toast({
                        title: 'Notificações Ativadas',
                        description: 'Você receberá notificações push',
                    });
                } else {
                    setPermissionStatus('denied');
                    setEnabled(false);

                    toast({
                        title: 'Permissão Negada',
                        description: 'Abra as configurações do app para habilitar notificações',
                        variant: 'destructive',
                    });
                }
            } else {
                // Disable push notifications in DB
                if (user) {
                    await supabase
                        .from('device_tokens')
                        .update({ enabled: false })
                        .eq('user_id', user.id)
                        .eq('platform', Capacitor.getPlatform());
                }

                setEnabled(false);

                toast({
                    title: 'Notificações Desativadas',
                    description: 'Você não receberá mais notificações push',
                });
            }
        } catch (error) {
            console.error('Error toggling push:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível alterar as notificações',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        if (!user) return;

        try {
            await supabase
                .from('device_tokens')
                .update({ notification_preferences: newPreferences })
                .eq('user_id', user.id)
                .eq('platform', Capacitor.getPlatform());

            toast({
                title: 'Preferências Atualizadas',
                description: 'Suas preferências de notificação foram salvas',
            });
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar as preferências',
                variant: 'destructive',
            });
        }
    };

    const openAppSettings = async () => {
        // On Android, this would open the app's notification settings
        // For now, we'll show a message
        toast({
            title: 'Configurações',
            description: 'Abra Configurações > Apps > Arboria > Notificações',
        });
    };

    if (!isNative) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellOff className="h-5 w-5" />
                        Notificações Push
                    </CardTitle>
                    <CardDescription>
                        Notificações push estão disponíveis apenas no app mobile
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações Push
                </CardTitle>
                <CardDescription>
                    Receba alertas em tempo real diretamente no seu dispositivo
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main Toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="push-enabled" className="text-base">
                            Habilitar Notificações Push
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Receba notificações quando o app estiver fechado
                        </p>
                    </div>
                    <Switch
                        id="push-enabled"
                        checked={enabled}
                        onCheckedChange={handleTogglePush}
                        disabled={loading}
                    />
                </div>

                {/* Permission Denied Warning */}
                {permissionStatus === 'denied' && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Permissão Negada</AlertTitle>
                        <AlertDescription className="space-y-2">
                            <p>As notificações foram negadas. Para habilitar:</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openAppSettings}
                                className="mt-2"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Abrir Configurações
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Notification Types */}
                {enabled && permissionStatus === 'granted' && (
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="text-base">Tipos de Notificação</Label>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="task_assigned"
                                    checked={preferences.task_assigned}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange('task_assigned', checked as boolean)
                                    }
                                />
                                <Label htmlFor="task_assigned" className="font-normal cursor-pointer">
                                    Tarefas Atribuídas
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="push_task_completion"
                                    checked={preferences.push_task_completion}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange('push_task_completion', checked as boolean)
                                    }
                                />
                                <Label htmlFor="push_task_completion" className="font-normal cursor-pointer">
                                    Conclusão de Tarefas
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="push_plan_completion"
                                    checked={preferences.push_plan_completion}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange('push_plan_completion', checked as boolean)
                                    }
                                />
                                <Label htmlFor="push_plan_completion" className="font-normal cursor-pointer">
                                    Planos Finalizados
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="push_invite_accepted"
                                    checked={preferences.push_invite_accepted}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange('push_invite_accepted', checked as boolean)
                                    }
                                />
                                <Label htmlFor="push_invite_accepted" className="font-normal cursor-pointer">
                                    Convites Aceitos
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="push_app_update"
                                    checked={preferences.push_app_update}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange('push_app_update', checked as boolean)
                                    }
                                />
                                <Label htmlFor="push_app_update" className="font-normal cursor-pointer">
                                    Atualizações do Aplicativo
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="push_alerts"
                                    checked={preferences.push_alerts}
                                    disabled // Always enabled for now
                                />
                                <Label htmlFor="push_alerts" className="font-normal text-muted-foreground">
                                    Alertas Urgentes (sempre ativo)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="system_update"
                                    checked={preferences.system_update}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange('system_update', checked as boolean)
                                    }
                                />
                                <Label htmlFor="system_update" className="font-normal cursor-pointer">
                                    Notificações do Sistema
                                </Label>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
