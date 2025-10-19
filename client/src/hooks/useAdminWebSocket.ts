import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface AdminWebSocketMessage {
  type: 'order_update' | 'driver_update' | 'admin_notification' | 'connection_status' | 'error';
  data: any;
  timestamp: string;
}

interface AdminWebSocketConfig {
  onMessage?: (message: AdminWebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface AdminWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: AdminWebSocketMessage | null;
  connectionAttempts: number;
}

export function useAdminWebSocket(config: AdminWebSocketConfig = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = config;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);

  const [state, setState] = useState<AdminWebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    connectionAttempts: 0
  });

  const getWebSocketUrl = useCallback(() => {
    if (import.meta.env.DEV) {
      return 'ws://localhost:5000/ws/tracking';
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws/tracking`;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null,
      connectionAttempts: prev.connectionAttempts + 1
    }));

    try {
      const wsUrl = getWebSocketUrl();
      console.log(`🔗 Connecting to Admin WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`✅ Admin WebSocket connected`);
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          connectionAttempts: 0
        }));

        // Send heartbeat to register as admin client
        ws.send(JSON.stringify({
          type: 'heartbeat',
          clientId: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: AdminWebSocketMessage = JSON.parse(event.data);
          console.log(`📦 Admin WebSocket message:`, message);

          setState(prev => ({ ...prev, lastMessage: message }));

          // Handle different message types
          switch (message.type) {
            case 'order_update':
              // Invalidate orders queries
              queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
              break;

            case 'driver_update':
              // Invalidate driver queries
              queryClient.invalidateQueries({ queryKey: ['/api/admin/drivers'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
              break;

            case 'admin_notification':
              // Just trigger the callback, don't invalidate queries
              break;

            case 'connection_status':
              console.log(`🔌 Admin connection status:`, message.data);
              break;

            case 'error':
              console.error(`❌ Admin WebSocket error:`, message.data);
              setState(prev => ({ ...prev, error: message.data.error || 'Unknown error' }));
              break;
          }

          onMessage?.(message);
        } catch (error) {
          console.error('❌ Failed to parse Admin WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 Admin WebSocket closed:`, event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect if not manually disconnected
        if (!isManualDisconnect && 
            state.connectionAttempts < maxReconnectAttempts && 
            event.code !== 1000) {
          
          console.log(`🔄 Attempting to reconnect in ${reconnectInterval}ms (attempt ${state.connectionAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ Admin WebSocket error:`, error);
        setState(prev => ({ ...prev, error: 'Connection error', isConnecting: false }));
        onError?.(error);
      };

    } catch (error) {
      console.error(`❌ Failed to create Admin WebSocket connection:`, error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create connection', 
        isConnecting: false 
      }));
    }
  }, [onConnect, onDisconnect, onError, onMessage, queryClient, 
      getWebSocketUrl, reconnectInterval, maxReconnectAttempts, state.connectionAttempts, isManualDisconnect]);

  const disconnect = useCallback(() => {
    console.log(`🔌 Manually disconnecting Admin WebSocket`);
    setIsManualDisconnect(true);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isConnecting: false,
      connectionAttempts: 0
    }));
  }, []);

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      }));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    setIsManualDisconnect(false);
    connect();

    return () => {
      setIsManualDisconnect(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Heartbeat interval
  useEffect(() => {
    if (state.isConnected) {
      const heartbeatInterval = setInterval(sendHeartbeat, 25000); // 25 seconds
      return () => clearInterval(heartbeatInterval);
    }
  }, [state.isConnected, sendHeartbeat]);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    lastMessage: state.lastMessage,
    connectionAttempts: state.connectionAttempts,
    connect,
    disconnect,
    sendHeartbeat
  };
}
