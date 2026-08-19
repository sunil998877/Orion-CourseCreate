import { useCallback, useEffect, useState } from 'react';
import {
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
} from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setNotifications(await getNotifications(token));
    } catch (error) {
      console.error('Notifications fetch failed:', error);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await markAllNotificationsRead(token);
    await fetchNotifications();
  }, [fetchNotifications]);

  const removeAllNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await clearNotifications(token);
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    notifOpen,
    setNotifOpen,
    fetchNotifications,
    markAllRead,
    removeAllNotifications,
  };
};
