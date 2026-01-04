import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PushNotifications, type Token, type ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePushNotifications() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || Capacitor.getPlatform() === 'web') {
            return;
        }

        const registerPush = async () => {
            try {
                const permStatus = await PushNotifications.checkPermissions();
                if (permStatus.receive === 'prompt') {
                    await PushNotifications.requestPermissions();
                }
                if ((await PushNotifications.checkPermissions()).receive === 'granted') {
                    await PushNotifications.register();
                }
            } catch (e) {
                console.error('Error requesting push permissions:', e);
            }
        };

        const setupListeners = async () => {
            await PushNotifications.addListener('registration', async (token: Token) => {
                try {
                    await supabase.from('device_tokens').upsert({
                        user_id: user.id,
                        token: token.value,
                        platform: Capacitor.getPlatform(),
                        enabled: true,
                        last_used_at: new Date().toISOString()
                    }, { onConflict: 'user_id,platform,token' });
                } catch (e) {
                    console.error('Error saving device token:', e);
                }
            });

            await PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Push registration error:', error);
            });

            await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                const data = notification.notification.data;
                const link = data?.deep_link || data?.link || data?.route;

                if (data?.type === 'app_update') {
                    navigate('/settings');
                } else if (link) {
                    if (link.startsWith('arboria://')) {
                        try {
                            const url = new URL(link);
                            navigate(url.pathname + url.search);
                        } catch (e) { console.error('Deep link error:', e); }
                    } else {
                        navigate(link);
                    }
                } else {
                    navigate('/alerts');
                }
            });
        };

        setupListeners();
        registerPush();

        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [user?.id]); // Only re-run if user ID changes

    return null;
}
