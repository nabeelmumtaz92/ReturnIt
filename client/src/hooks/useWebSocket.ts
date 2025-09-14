import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: 'location_update' | 'status_update' | 'tracking_event' | 'error' | 'connection_status';
  trackingNumber: string;
  data: any;
  timestamp: string;
}

interface WebSocketConfig {
  trackingNumber: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  connectionAttempts: number;
}

export function useWebSocketTracking(config: WebSocketConfig) {
  const {
    trackingNumber,
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

  const [state, setState] = useState<WebSocketState>({
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
      // Production WebSocket URL - use same host as current page but with wss://
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
      console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`✅ WebSocket connected for tracking: ${trackingNumber}`);
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          connectionAttempts: 0
        }));

        // Join tracking room
        ws.send(JSON.stringify({
          type: 'join_tracking',
          trackingNumber,
          clientId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log(`📦 WebSocket message for ${trackingNumber}:`, message);

          setState(prev => ({ ...prev, lastMessage: message }));

          // Handle different message types
          switch (message.type) {
            case 'location_update':
              // Update React Query cache for tracking info
              queryClient.invalidateQueries({ 
                queryKey: ['/api/tracking', trackingNumber] 
              });
              
              // Also invalidate tracking events
              queryClient.invalidateQueries({ 
                queryKey: ['/api/tracking', trackingNumber, 'events'] 
              });
              break;

            case 'status_update':
              // Update tracking data immediately
              queryClient.invalidateQueries({ 
                queryKey: ['/api/tracking', trackingNumber] 
              });
              break;

            case 'tracking_event':
              // Update tracking events
              queryClient.invalidateQueries({ 
                queryKey: ['/api/tracking', trackingNumber, 'events'] 
              });
              break;

            case 'connection_status':
              console.log(`🔌 Connection status for ${trackingNumber}:`, message.data);
              break;

            case 'error':
              console.error(`❌ WebSocket error for ${trackingNumber}:`, message.data);
              setState(prev => ({ ...prev, error: message.data.error || 'Unknown error' }));
              break;
          }

          onMessage?.(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed for ${trackingNumber}:`, event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect if not manually disconnected
        if (!isManualDisconnect && 
            state.connectionAttempts < maxReconnectAttempts && 
            event.code !== 1000) { // 1000 is normal closure
          
          console.log(`🔄 Attempting to reconnect in ${reconnectInterval}ms (attempt ${state.connectionAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for ${trackingNumber}:`, error);
        setState(prev => ({ ...prev, error: 'Connection error', isConnecting: false }));
        onError?.(error);
      };

    } catch (error) {
      console.error(`❌ Failed to create WebSocket connection:`, error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create connection', 
        isConnecting: false 
      }));
    }
  }, [trackingNumber, onConnect, onDisconnect, onError, onMessage, queryClient, 
      getWebSocketUrl, reconnectInterval, maxReconnectAttempts, state.connectionAttempts, isManualDisconnect]);

  const disconnect = useCallback(() => {
    console.log(`🔌 Manually disconnecting WebSocket for ${trackingNumber}`);
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
  }, [trackingNumber]);

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'heartbeat',
        trackingNumber,
        timestamp: new Date().toISOString()
      }));
    }
  }, [trackingNumber]);

  // Auto-connect when tracking number changes
  useEffect(() => {
    if (trackingNumber) {
      setIsManualDisconnect(false);
      connect();
    }

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
  }, [trackingNumber, connect]);

  // Heartbeat interval
  useEffect(() => {
    if (state.isConnected) {
      const heartbeatInterval = setInterval(sendHeartbeat, 25000); // 25 seconds
      return () => clearInterval(heartbeatInterval);
    }
  }, [state.isConnected, sendHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, []);

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