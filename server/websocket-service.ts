import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { trackingNumberSchema } from '@shared/validation';
import { storage } from './storage';
import type { Location } from '@shared/schema';

interface TrackingClient {
  ws: WebSocket;
  trackingNumber: string;
  clientId: string;
  joinedAt: Date;
}

interface WebSocketMessage {
  type: 'join_tracking' | 'leave_tracking' | 'heartbeat';
  trackingNumber?: string;
  clientId?: string;
}

interface BroadcastMessage {
  type: 'location_update' | 'status_update' | 'tracking_event' | 'error' | 'connection_status' | 'admin_notification';
  trackingNumber?: string;
  data: any;
  timestamp: string;
}

class WebSocketTrackingService {
  private wss: WebSocketServer | null = null;
  private trackingRooms: Map<string, Set<TrackingClient>> = new Map();
  private clientConnections: Map<string, TrackingClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  public initialize(server: any) {
    console.log('🔌 Initializing WebSocket tracking service...');
    
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/tracking',
      clientTracking: true
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();

    console.log('✅ WebSocket tracking service initialized');
    console.log('📡 WebSocket endpoint: ws://localhost:5000/ws/tracking');
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const clientId = this.generateClientId();
    console.log(`🔗 New WebSocket connection: ${clientId}`);

    // Send connection confirmation
    this.sendToClient(ws, {
      type: 'connection_status',
      trackingNumber: '',
      data: { 
        status: 'connected', 
        clientId,
        message: 'Connected to ReturnIt real-time tracking'
      },
      timestamp: new Date().toISOString()
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message, clientId);
      } catch (error) {
        console.error('❌ Error processing WebSocket message:', error);
        this.sendToClient(ws, {
          type: 'error',
          trackingNumber: '',
          data: { 
            error: 'Invalid message format',
            message: 'Please send valid JSON messages'
          },
          timestamp: new Date().toISOString()
        });
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket connection closed: ${clientId}`);
      this.removeClient(clientId);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for client ${clientId}:`, error);
      this.removeClient(clientId);
    });

    // Handle connection pong for heartbeat
    ws.on('pong', () => {
      if ((ws as any).isAlive !== undefined) {
        (ws as any).isAlive = true;
      }
    });
  }

  private async handleMessage(ws: WebSocket, message: WebSocketMessage, clientId: string) {
    switch (message.type) {
      case 'join_tracking':
        await this.handleJoinTracking(ws, message.trackingNumber!, clientId);
        break;
      
      case 'leave_tracking':
        this.handleLeaveTracking(clientId);
        break;
      
      case 'heartbeat':
        this.sendToClient(ws, {
          type: 'connection_status',
          trackingNumber: '',
          data: { status: 'alive', clientId },
          timestamp: new Date().toISOString()
        });
        break;
      
      default:
        this.sendToClient(ws, {
          type: 'error',
          trackingNumber: '',
          data: { 
            error: 'Unknown message type',
            supportedTypes: ['join_tracking', 'leave_tracking', 'heartbeat']
          },
          timestamp: new Date().toISOString()
        });
    }
  }

  private async handleJoinTracking(ws: WebSocket, trackingNumber: string, clientId: string) {
    try {
      // Validate tracking number format
      const validation = trackingNumberSchema.safeParse(trackingNumber);
      if (!validation.success) {
        this.sendToClient(ws, {
          type: 'error',
          trackingNumber,
          data: { 
            error: 'Invalid tracking number format',
            message: 'Tracking number must be in format RTN-XXXXXXXX'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if order exists and tracking is enabled
      const order = await storage.getOrderByTrackingNumber(trackingNumber);
      if (!order) {
        this.sendToClient(ws, {
          type: 'error',
          trackingNumber,
          data: { 
            error: 'Order not found',
            message: 'No order found with this tracking number'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!order.trackingEnabled) {
        this.sendToClient(ws, {
          type: 'error',
          trackingNumber,
          data: { 
            error: 'Tracking disabled',
            message: 'Tracking is not enabled for this order'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (order.trackingExpiresAt && new Date() > order.trackingExpiresAt) {
        this.sendToClient(ws, {
          type: 'error',
          trackingNumber,
          data: { 
            error: 'Tracking expired',
            message: 'Tracking for this order has expired'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Remove client from previous tracking if any
      this.removeClient(clientId);

      // Create tracking client
      const trackingClient: TrackingClient = {
        ws,
        trackingNumber,
        clientId,
        joinedAt: new Date()
      };

      // Add to room and client tracking
      if (!this.trackingRooms.has(trackingNumber)) {
        this.trackingRooms.set(trackingNumber, new Set());
      }
      this.trackingRooms.get(trackingNumber)!.add(trackingClient);
      this.clientConnections.set(clientId, trackingClient);

      console.log(`📍 Client ${clientId} joined tracking room: ${trackingNumber}`);
      console.log(`🏠 Room ${trackingNumber} now has ${this.trackingRooms.get(trackingNumber)!.size} clients`);

      // Send confirmation and current order status
      this.sendToClient(ws, {
        type: 'connection_status',
        trackingNumber,
        data: { 
          status: 'joined_tracking',
          message: `Successfully joined tracking for ${trackingNumber}`,
          orderStatus: order.status,
          clientId
        },
        timestamp: new Date().toISOString()
      });

      // Send current driver location if available
      if (order.driverId) {
        const driverLocation = await storage.getDriverLocation(order.driverId);
        if (driverLocation) {
          this.sendToClient(ws, {
            type: 'location_update',
            trackingNumber,
            data: {
              driverId: order.driverId,
              location: driverLocation,
              orderId: order.id,
              orderStatus: order.status
            },
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      console.error('❌ Error joining tracking:', error);
      this.sendToClient(ws, {
        type: 'error',
        trackingNumber,
        data: { 
          error: 'Internal server error',
          message: 'Failed to join tracking room'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleLeaveTracking(clientId: string) {
    this.removeClient(clientId);
  }

  private removeClient(clientId: string) {
    const client = this.clientConnections.get(clientId);
    if (!client) return;

    const { trackingNumber } = client;
    const room = this.trackingRooms.get(trackingNumber);
    
    if (room) {
      room.delete(client);
      if (room.size === 0) {
        this.trackingRooms.delete(trackingNumber);
        console.log(`🗑️ Removed empty tracking room: ${trackingNumber}`);
      } else {
        console.log(`👋 Client ${clientId} left room ${trackingNumber} (${room.size} remaining)`);
      }
    }

    this.clientConnections.delete(clientId);
  }

  // Legacy method - now handled by new enhanced broadcast methods

  public broadcastStatusUpdate(trackingNumber: string, newStatus: string, orderId: string, metadata?: any) {
    const room = this.trackingRooms.get(trackingNumber);
    if (!room || room.size === 0) return;

    const message: BroadcastMessage = {
      type: 'status_update',
      trackingNumber,
      data: {
        orderId,
        newStatus,
        statusDisplayName: newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        metadata
      },
      timestamp: new Date().toISOString()
    };

    let successCount = 0;
    room.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          this.sendToClient(client.ws, message);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to send status update to client ${client.clientId}:`, error);
          this.removeClient(client.clientId);
        }
      } else {
        this.removeClient(client.clientId);
      }
    });

    if (successCount > 0) {
      console.log(`📊 Broadcasted status update for ${trackingNumber} to ${successCount} clients`);
    }
  }

  public broadcastTrackingEvent(trackingNumber: string, eventType: string, description: string, location?: Location, driverId?: number, metadata?: any) {
    const room = this.trackingRooms.get(trackingNumber);
    if (!room || room.size === 0) return;

    const message: BroadcastMessage = {
      type: 'tracking_event',
      trackingNumber,
      data: {
        eventType,
        description,
        location,
        driverId,
        metadata
      },
      timestamp: new Date().toISOString()
    };

    let successCount = 0;
    room.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          this.sendToClient(client.ws, message);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to send tracking event to client ${client.clientId}:`, error);
          this.removeClient(client.clientId);
        }
      } else {
        this.removeClient(client.clientId);
      }
    });

    if (successCount > 0) {
      console.log(`🎯 Broadcasted tracking event '${eventType}' for ${trackingNumber} to ${successCount} clients`);
    }
  }

  private sendToClient(ws: WebSocket, message: BroadcastMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // NEW: Enhanced broadcast methods for driver GPS and order management
  public broadcastOrderUpdate(update: {
    orderId: string;
    status: string;
    driverId?: number;
    location?: any;
    timestamp: string;
    notes?: string;
    cancellation?: any;
  }) {
    const message: BroadcastMessage = {
      type: 'status_update',
      data: {
        orderId: update.orderId,
        status: update.status,
        driverId: update.driverId,
        location: update.location,
        notes: update.notes,
        cancellation: update.cancellation
      },
      timestamp: update.timestamp
    };

    // Broadcast to all clients tracking this order (by orderId)
    this.broadcastToTracking(update.orderId, message);
    
    console.log(`📡 Broadcasted order update for ${update.orderId}: ${update.status}`);
  }

  public broadcastLocationUpdate(update: {
    orderId: string;
    driverId: number;
    location: any;
    timestamp: string;
  }) {
    const message: BroadcastMessage = {
      type: 'location_update',
      data: {
        orderId: update.orderId,
        driverId: update.driverId,
        location: update.location
      },
      timestamp: update.timestamp
    };

    // Broadcast to all clients tracking this order
    this.broadcastToTracking(update.orderId, message);
    
    console.log(`📍 Broadcasted location update for order ${update.orderId}`);
  }

  public broadcastToDriver(driverId: number, message: {
    type: string;
    assignment?: any;
    order?: any;
    expiresAt?: Date;
  }) {
    const broadcastMessage: BroadcastMessage = {
      type: 'admin_notification',
      data: {
        targetDriver: driverId,
        message: message
      },
      timestamp: new Date().toISOString()
    };

    // For now, broadcast to all admin clients
    // In a real implementation, you'd maintain driver-specific connections
    this.broadcastToAll(broadcastMessage);
    
    console.log(`👤 Broadcasted message to driver ${driverId}: ${message.type}`);
  }

  private broadcastToTracking(trackingIdentifier: string, message: BroadcastMessage) {
    const clients = this.trackingRooms.get(trackingIdentifier);
    if (clients) {
      const activeClients = Array.from(clients).filter(client => client.ws.readyState === WebSocket.OPEN);
      
      activeClients.forEach(client => {
        this.sendToClient(client.ws, message);
      });
      
      // Remove inactive clients
      const inactiveClients = Array.from(clients).filter(client => client.ws.readyState !== WebSocket.OPEN);
      inactiveClients.forEach(client => {
        clients.delete(client);
        this.clientConnections.delete(client.clientId);
      });
    }
  }

  private broadcastToAll(message: BroadcastMessage) {
    this.clientConnections.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        this.sendToClient(client.ws, message);
      }
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: WebSocket) => {
        if ((ws as any).isAlive === false) {
          console.log('💔 Terminating unresponsive WebSocket connection');
          return ws.terminate();
        }

        (ws as any).isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds

    console.log('💓 WebSocket heartbeat started (30s interval)');
  }

  public broadcastAdminNotification(notificationData: any) {
    if (!this.wss) return;

    const message: BroadcastMessage = {
      type: 'admin_notification',
      data: notificationData,
      timestamp: new Date().toISOString()
    };

    let successCount = 0;
    this.wss.clients.forEach((ws: WebSocket) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          this.sendToClient(ws, message);
          successCount++;
        } catch (error) {
          console.error('❌ Failed to send admin notification:', error);
        }
      }
    });

    if (successCount > 0) {
      console.log(`🔔 Admin notification sent to ${successCount} clients`);
    }
  }

  public getStats() {
    return {
      totalRooms: this.trackingRooms.size,
      totalConnections: this.clientConnections.size,
      roomDetails: Array.from(this.trackingRooms.entries()).map(([trackingNumber, clients]) => ({
        trackingNumber,
        clientCount: clients.size,
        clients: Array.from(clients).map(client => ({
          clientId: client.clientId,
          joinedAt: client.joinedAt
        }))
      }))
    };
  }

  public cleanup() {
    console.log('🧹 Cleaning up WebSocket service...');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.trackingRooms.clear();
    this.clientConnections.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    console.log('✅ WebSocket service cleanup completed');
  }
}

// Export singleton instance
export const webSocketService = new WebSocketTrackingService();