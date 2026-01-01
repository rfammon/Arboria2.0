export type NotificationCategory =
    | 'task_assigned'
    | 'task_completed'
    | 'plan_updated'
    | 'comment_added'
    | 'urgent_alert'
    | 'system_update';

export interface PushNotificationPayload {
    title: string;
    body: string;
    category: NotificationCategory;
    data: {
        type: string;
        id: string;
        deep_link?: string;
        [key: string]: any;
    };
}

export interface InAppNotification {
    id: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    is_read: boolean;
    action_link?: string;
    created_at: string;
    metadata?: any;
}
