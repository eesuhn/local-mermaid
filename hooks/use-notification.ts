import { useState, useCallback } from 'react';
import { NotificationProps } from '@/types/notification';
import { UI_CONSTANTS } from '@/lib/constants';

export interface UseNotificationReturn {
  notification: NotificationProps | null;
  showNotification: (notification: NotificationProps) => void;
  hideNotification: () => void;
}

export function useNotification(): UseNotificationReturn {
  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  );

  const showNotification = useCallback((notif: NotificationProps) => {
    setNotification(notif);

    // Auto-hide after timeout
    setTimeout(() => {
      setNotification(null);
    }, UI_CONSTANTS.NOTIFICATION_TIMEOUT);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
