import { useEffect, useRef } from 'react';

// Các loại event BE có thể gửi
type WSEvent = 'ai_done' | 'ai_error';

interface WSMessage {
  event: WSEvent;
  group_id: number;
  payload?: any;
}

interface Options {
  onAIDone?: () => void;
  onAIError?: (payload?: any) => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

/**
 * useGroupWebSocket — Kết nối WebSocket tới /ws/groups/:groupId
 * Thay thế polling interval, nhận event real-time từ BE.
 *
 * @param groupId  - ID nhóm cần lắng nghe
 * @param enabled  - Chỉ kết nối khi true (thường là khi is_ai_generating = true)
 * @param options  - Callbacks xử lý từng loại event
 */
export function useGroupWebSocket(
  groupId: string | number | undefined,
  enabled: boolean,
  options: Options
) {
  const wsRef = useRef<WebSocket | null>(null);
  const optionsRef = useRef(options);

  // Giữ options ref luôn mới nhất để tránh stale closure
  optionsRef.current = options;

  useEffect(() => {
    // Không kết nối nếu chưa có groupId hoặc không cần thiết
    if (!groupId || !enabled) return;

    const url = `${WS_BASE_URL}/ws/groups/${groupId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Kết nối nhóm ${groupId}`);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        console.log(`[WS] Nhận event: ${msg.event}`, msg);

        switch (msg.event) {
          case 'ai_done':
            optionsRef.current.onAIDone?.();
            break;
          case 'ai_error':
            optionsRef.current.onAIError?.(msg.payload);
            break;
        }
      } catch {
        // Bỏ qua message không parse được
      }
    };

    ws.onerror = (err) => {
      console.warn('[WS] Lỗi kết nối:', err);
    };

    ws.onclose = () => {
      console.log(`[WS] Ngắt kết nối nhóm ${groupId}`);
    };

    // Cleanup: đóng kết nối khi component unmount hoặc enabled = false
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [groupId, enabled]);
}
