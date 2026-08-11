/**
 * useNotifications — Real-time notification hook
 *
 * Connects to the Socket.IO server after the user authenticates,
 * receives push notifications in real-time, and manages local state.
 *
 * Usage:
 *   const { notifications, unreadCount, markRead, markAllRead } = useNotifications(firebaseUser);
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from 'firebase/auth';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  connected: boolean;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNotifications(firebaseUser: User | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch existing notifications from REST API on mount
  const fetchNotifications = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch (err) {
      console.warn('[Notifications] Failed to fetch existing notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      // Disconnect and clear state when user logs out
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      setConnected(false);
      return;
    }

    let isMounted = true;

    const connect = async () => {
      try {
        const token = await firebaseUser.getIdToken();

        // Fetch existing notifications first
        await fetchNotifications(token);

        if (!isMounted) return;

        // Connect Socket.IO with auth token
        const socket = io('/', {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (isMounted) setConnected(true);
          console.log('[Socket.IO] Connected:', socket.id);
        });

        socket.on('disconnect', () => {
          if (isMounted) setConnected(false);
        });

        // Real-time notification event from server
        socket.on('notification', (notification: AppNotification) => {
          if (isMounted) {
            setNotifications((prev) => [notification, ...prev]);
          }
        });
      } catch (err) {
        console.error('[Notifications] Connection error:', err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [firebaseUser, fetchNotifications]);

  const markRead = useCallback(async (ids: string[]) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('[Notifications] markRead failed:', err);
    }
  }, [firebaseUser]);

  const markAllRead = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('[Notifications] markAllRead failed:', err);
    }
  }, [firebaseUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, connected, markRead, markAllRead };
}
