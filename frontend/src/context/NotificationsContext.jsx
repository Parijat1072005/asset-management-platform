import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    const saved = localStorage.getItem('notifEnabled');
    return saved === null ? true : saved === 'true';
  });

  // Only persist IDs that were EXPLICITLY dismissed (mark-all-read)
  // Do NOT persist fetched IDs — new statuses should always surface
  const [dismissedIds, setDismissedIds] = useState(
    () => new Set(JSON.parse(localStorage.getItem('dismissedNotifIds') || '[]'))
  );

  const fetchNotifications = useCallback(async () => {
    if (!notifEnabled) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/bookings/mybookings', config);

      // Build notifications from ALL non-Pending bookings
      const incoming = data
        .filter(b => b.status !== 'Pending')
        .map(b => ({
          id: `${b._id}-${b.status}`,
          bookingId: b._id,
          assetName: b.asset?.name || 'Asset',
          status: b.status,
          date: new Date(b.updatedAt || b.createdAt),
          // Only mark as read if admin explicitly dismissed it
          read: dismissedIds.has(`${b._id}-${b.status}`),
        }));

      // Sort newest first, keep latest 30
      incoming.sort((a, b) => b.date - a.date);
      setNotifications(incoming.slice(0, 30));
    } catch (_) {
      // silent — user may not be logged in yet
    }
  }, [notifEnabled, dismissedIds]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const newDismissed = new Set([...dismissedIds, ...updated.map(n => n.id)]);
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedNotifIds', JSON.stringify([...newDismissed]));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, notifEnabled, setNotifEnabled, fetchNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
