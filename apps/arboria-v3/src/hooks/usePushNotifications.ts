import { useEffect } from 'react';
import { PushNotifications, type Token, type ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePushNotifications() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || Capacitor.getPlatform() === 'web') {
            return;
        }

        // 1. Request permission
        const registerPush = async () => {
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
        };

        // 3. Listen for token registration
        PushNotifications.addListener('registration', async (token: Token) => {

            // Save token to Supabase
            try {
                const { error } = await supabase
                    .from('user_device_tokens')
                    .upsert({
                        user_id: user.id,
                        token: token.value,
                        platform: Capacitor.getPlatform(),
                        last_seen_at: new Date().toISOString()
                    }, { onConflict: 'user_id,token' });

                if (error) console.error('Error saving device token:', error);
            } catch (e) {
                console.error('Unexpected error saving token:', e);
            }
        });

        // 4. Handle registration error
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Push registration error:', error);
        });

        // 5. Handle notification received in foreground
        PushNotifications.addListener('pushNotificationReceived', () => {
            // You could show a toast here if you want extra visibility
        });

        // 6. Handle action performed (user clicked notification)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            const link = notification.notification.data?.link;
            if (link) {
                window.location.href = link;
            }
        });

        registerPush();

        // Cleanup
        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [user]);

    return null;
}
