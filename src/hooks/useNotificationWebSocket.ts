import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { addNotification } from '@/features/notifications/redux/notificationSlice';
import { Notification } from '@/models/notification';

export const useNotificationWebSocket = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.auth.token) || localStorage.getItem('jwt');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    // TODO: move base URL to env config
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws/notifications?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to notification WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'notification' && data.payload) {
          const notif: Notification = data.payload;
          dispatch(addNotification(notif));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from notification WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [dispatch, token]);

  return wsRef.current;
};
