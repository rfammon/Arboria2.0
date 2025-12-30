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

        // 1. Request permission
        const registerPush = async () => {
            try {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    console.warn('User denied push notification permissions');
                    return;
                }

                // 2. Register with FCM/APNS
                await PushNotifications.register();
            } catch (e) {
                console.error('Error requesting push permissions:', e);
            }
        };

        const setupListeners = async () => {
            // 3. Listen for token registration
            await PushNotifications.addListener('registration', async (token: Token) => {
                console.log('Push registration success, token:', token.value);

                // Save token to Supabase
                try {
                    const { error } = await supabase
                        .from('device_tokens')
                        .upsert({
                            user_id: user.id,
                            token: token.value,
                            platform: Capacitor.getPlatform(),
                            enabled: true,
                            last_used_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id,platform,token',
                            ignoreDuplicates: false
                        });

                    if (error) {
                        console.error('Error saving device token:', error);
                    } else {
                        console.log('Device token saved successfully');
                    }
                } catch (e) {
                    console.error('Unexpected error saving token:', e);
                }
            });

            // 4. Handle registration error
            await PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Push registration error:', error);
            });

            // 5. Handle notification received in foreground
            await PushNotifications.addListener('pushNotificationReceived', () => {
                // You could show a toast here if you want extra visibility
                console.log('Push received in foreground');
            });

            // 6. Handle action performed (user clicked notification)
            await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                const data = notification.notification.data;
                const link = data?.deep_link || data?.link || data?.action_link || data?.route;
                const type = data?.type;

                console.log('Notification action performed:', { data, link, type });

                // Priority 1: App Update notification
                if (type === 'app_update') {
                    console.log('Navigating to Settings for App Update');
                    navigate('/settings');
                    return;
                }

                // Priority 2: Explicit Link
                if (link) {
                    // Check if it's a full URL Scheme
                    if (link.startsWith('arboria://')) {
                        try {
                            const url = new URL(link);
                            let path = url.pathname;
                            if (url.host && url.host !== 'arboria.app') {
                                path = '/' + url.host + path;
                            }
                            path = path.replace('//', '/');
                            if (url.search) path += url.search;
                            navigate(path);
                        } catch (e) {
                            console.error('Error parsing deep link:', e);
                        }
                    } else {
                        // Assume it's a relative path like '/execution'
                        navigate(link);
                    }
                    return;
                }

                // Priority 3: Default Fallback for other alerts
                console.log('No specific link found, navigating to Alerts Center');
                navigate('/alerts');
            });
        };

        setupListeners();
        registerPush();

        // Cleanup
        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [user, navigate]);

    return null;
}
