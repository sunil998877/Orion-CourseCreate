import { API_BASE } from '../utils/api';

export const getNotifications = async (token: string) => {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const markAllNotificationsRead = async (token: string) => {
  const res = await fetch(`${API_BASE}/notifications/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to mark notifications as read');
  return res;
};

export const clearNotifications = async (token: string) => {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to clear notifications');
  return res;
};

export const getUserProfile = async (token: string) => {
  const res = await fetch(`${API_BASE}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
};
