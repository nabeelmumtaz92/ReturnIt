// Support Ticket Service with Escalation Timeline
// Critical: 15min→1hr→4hrs, High: 1hr→4hrs→24hrs, Standard: 24hrs→72hrs→3-5days

import { sql } from "drizzle-orm";

interface EscalationRule {
  priority: 'critical' | 'high' | 'medium' | 'low';
  firstResponse: number; // minutes
  escalation1: number; // minutes  
  escalation2: number; // minutes
  maxResolutionTime: number; // minutes
}

interface TicketEscalation {
  ticketId: number;
  escalationLevel: number;
  timeoutId: NodeJS.Timeout;
  nextEscalationTime: Date;
}

export class SupportTicketService {
  private activeEscalations = new Map<number, TicketEscalation>();
  
  // Escalation rules as specified by user
  private escalationRules: Record<string, EscalationRule> = {
    critical: {
      priority: 'critical',
      firstResponse: 15,        // 15 minutes
      escalation1: 60,          // 1 hour  
      escalation2: 240,         // 4 hours
      maxResolutionTime: 480    // 8 hours max
    },
    high: {
      priority: 'high', 
      firstResponse: 60,        // 1 hour
      escalation1: 240,         // 4 hours
      escalation2: 1440,        // 24 hours
      maxResolutionTime: 2880   // 48 hours max
    },
    medium: {
      priority: 'medium',
      firstResponse: 1440,      // 24 hours
      escalation1: 4320,        // 72 hours (3 days)
      escalation2: 7200,        // 120 hours (5 days)
      maxResolutionTime: 10080  // 7 days max
    },
    low: {
      priority: 'medium', // treating low as medium
      firstResponse: 1440,      // 24 hours
      escalation1: 4320,        // 72 hours
      escalation2: 7200,        // 120 hours
      maxResolutionTime: 10080  // 7 days max
    }
  };

  constructor(private storage: any, private webSocketService?: any) {}

  // Create new support ticket with automatic escalation tracking
  async createTicket(ticketData: {
    customerId?: number;
    orderId?: string;
    category: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    subject: string;
    description: string;
    channel: 'chat' | 'email' | 'phone' | 'app';
  }) {
    try {
      // Generate unique ticket number
      const ticketNumber = this.generateTicketNumber();
      
      const ticket = await this.storage.createSupportTicket({
        ticketNumber,
        customerId: ticketData.customerId,
        orderId: ticketData.orderId,
        category: ticketData.category,
        priority: ticketData.priority,
        subject: ticketData.subject,
        description: ticketData.description,
        channel: ticketData.channel,
        status: 'open',
        escalationLevel: 0,
        createdAt: new Date()
      });

      // Start escalation monitoring
      await this.startEscalationMonitoring(ticket.id, ticketData.priority);
      
      // Notify support team
      await this.notifySupportTeam('new_ticket', ticket);
      
      // Send confirmation to customer
      if (ticketData.customerId) {
        await this.notifyCustomer(ticketData.customerId, 'ticket_created', ticket);
      }

      console.log(`🎫 Support ticket ${ticket.ticketNumber} created with ${ticketData.priority} priority`);
      return ticket;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  // Start escalation monitoring for a ticket
  async startEscalationMonitoring(ticketId: number, priority: string) {
    const rule = this.escalationRules[priority] || this.escalationRules.medium;
    const firstResponseTime = rule.firstResponse * 60 * 1000; // Convert to milliseconds
    
    const timeoutId = setTimeout(() => {
      this.handleEscalation(ticketId, 0, priority);
    }, firstResponseTime);

    this.activeEscalations.set(ticketId, {
      ticketId,
      escalationLevel: 0,
      timeoutId,
      nextEscalationTime: new Date(Date.now() + firstResponseTime)
    });

    console.log(`⏰ Escalation monitoring started for ticket ${ticketId} (${priority} priority, first response in ${rule.firstResponse} minutes)`);
  }

  // Handle ticket escalation
  private async handleEscalation(ticketId: number, currentLevel: number, priority: string) {
    try {
      const ticket = await this.storage.getSupportTicket(ticketId);
      if (!ticket || ticket.status === 'resolved' || ticket.status === 'closed') {
        this.stopEscalationMonitoring(ticketId);
        return;
      }

      const newLevel = currentLevel + 1;
      const rule = this.escalationRules[priority] || this.escalationRules.medium;
      
      // Update ticket with escalation
      await this.storage.updateSupportTicket(ticketId, {
        escalationLevel: newLevel,
        slaBreached: true,
        updatedAt: new Date()
      });

      // Add escalation message
      await this.addSystemMessage(ticketId, 
        `Ticket escalated to level ${newLevel} due to SLA breach. Priority: ${priority}`
      );

      // Notify escalation based on level
      await this.notifyEscalation(ticketId, newLevel, priority);

      // Schedule next escalation if not at max level
      // FIXED: Calculate absolute time from ticket creation, not cumulative delays
      let nextEscalationTime: number | null = null;
      const ticketCreatedAt = new Date(ticket.createdAt).getTime();
      
      switch (newLevel) {
        case 1:
          // Level 1: escalation1 minutes from creation
          nextEscalationTime = ticketCreatedAt + (rule.escalation1 * 60 * 1000);
          break;
        case 2:
          // Level 2: escalation2 minutes from creation
          nextEscalationTime = ticketCreatedAt + (rule.escalation2 * 60 * 1000);
          break;
        default:
          // Max escalation reached
          await this.handleMaxEscalation(ticketId, priority);
          return;
      }

      if (nextEscalationTime) {
        const currentTime = Date.now();
        const timeUntilNextEscalation = nextEscalationTime - currentTime;
        
        // If time has already passed, escalate immediately
        if (timeUntilNextEscalation <= 0) {
          setImmediate(() => this.handleEscalation(ticketId, newLevel, priority));
        } else {
          const timeoutId = setTimeout(() => {
            this.handleEscalation(ticketId, newLevel, priority);
          }, timeUntilNextEscalation);

          this.activeEscalations.set(ticketId, {
            ticketId,
            escalationLevel: newLevel,
            timeoutId,
            nextEscalationTime: new Date(nextEscalationTime)
          });
        }
      }

      console.log(`🚨 Ticket ${ticketId} escalated to level ${newLevel} (${priority} priority)`);
    } catch (error) {
      console.error(`Error escalating ticket ${ticketId}:`, error);
    }
  }

  // Handle maximum escalation reached
  private async handleMaxEscalation(ticketId: number, priority: string) {
    await this.addSystemMessage(ticketId, 
      `URGENT: Maximum escalation level reached. Immediate management attention required.`
    );
    
    // Notify management/admin
    await this.notifyManagement(ticketId, priority);
    
    this.stopEscalationMonitoring(ticketId);
    console.log(`🔥 Ticket ${ticketId} reached maximum escalation - management notified`);
  }

  // Add response to ticket (stops escalation if from agent)
  async addTicketResponse(ticketId: number, senderId: number, content: string, senderType: 'customer' | 'agent' | 'system') {
    try {
      // Add message
      const message = await this.storage.createSupportMessage({
        ticketId,
        senderId,
        senderType,
        content,
        createdAt: new Date()
      });

      // If agent response, stop escalation and start resolution timer
      if (senderType === 'agent') {
        const ticket = await this.storage.getSupportTicket(ticketId);
        
        // Calculate first response time if this is the first agent response
        if (ticket && !ticket.firstResponseTime) {
          const responseTime = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60));
          await this.storage.updateSupportTicket(ticketId, {
            firstResponseTime: responseTime,
            status: 'in_progress',
            updatedAt: new Date()
          });
        }

        // Reset escalation monitoring
        this.stopEscalationMonitoring(ticketId);
        
        // Notify customer of response
        if (ticket?.customerId) {
          await this.notifyCustomer(ticket.customerId, 'agent_response', ticket);
        }
      }

      // Notify relevant parties via WebSocket
      await this.notifyTicketUpdate(ticketId, {
        type: 'new_message',
        message,
        senderType
      });

      return message;
    } catch (error) {
      console.error('Error adding ticket response:', error);
      throw error;
    }
  }

  // Resolve ticket
  async resolveTicket(ticketId: number, resolvedBy: number, resolutionNote?: string) {
    try {
      const ticket = await this.storage.getSupportTicket(ticketId);
      if (!ticket) throw new Error('Ticket not found');

      const resolvedAt = new Date();
      const resolutionTime = Math.floor((resolvedAt.getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60));

      await this.storage.updateSupportTicket(ticketId, {
        status: 'resolved',
        resolvedAt,
        resolutionTime,
        updatedAt: resolvedAt
      });

      // Add resolution message
      if (resolutionNote) {
        await this.addSystemMessage(ticketId, `Ticket resolved: ${resolutionNote}`);
      }

      // Stop escalation monitoring
      this.stopEscalationMonitoring(ticketId);

      // Notify customer
      if (ticket.customerId) {
        await this.notifyCustomer(ticket.customerId, 'ticket_resolved', ticket);
      }

      console.log(`✅ Ticket ${ticket.ticketNumber} resolved in ${resolutionTime} minutes`);
      return { success: true, resolutionTime };
    } catch (error) {
      console.error('Error resolving ticket:', error);
      throw error;
    }
  }

  // Get tickets with filtering
  async getTickets(filters: {
    status?: string;
    priority?: string;
    assignedAgentId?: number;
    customerId?: number;
    category?: string;
    escalationLevel?: number;
    slaBreached?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      return await this.storage.getSupportTickets(filters);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Get ticket details with messages
  async getTicketDetails(ticketId: number) {
    try {
      const ticket = await this.storage.getSupportTicket(ticketId);
      if (!ticket) throw new Error('Ticket not found');

      const messages = await this.storage.getSupportMessages(ticketId);
      const escalationInfo = this.activeEscalations.get(ticketId);

      return {
        ...ticket,
        messages,
        escalationInfo: escalationInfo ? {
          nextEscalationTime: escalationInfo.nextEscalationTime,
          escalationLevel: escalationInfo.escalationLevel
        } : null
      };
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  }

  // Assign ticket to agent
  async assignTicket(ticketId: number, agentId: number, assignedBy: number) {
    try {
      await this.storage.updateSupportTicket(ticketId, {
        assignedAgentId: agentId,
        status: 'in_progress',
        updatedAt: new Date()
      });

      await this.addSystemMessage(ticketId, `Ticket assigned to agent ${agentId}`);
      
      // Notify agent of assignment
      await this.notifyAgent(agentId, 'ticket_assigned', ticketId);

      console.log(`👤 Ticket ${ticketId} assigned to agent ${agentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }

  // Stop escalation monitoring
  stopEscalationMonitoring(ticketId: number) {
    const escalation = this.activeEscalations.get(ticketId);
    if (escalation) {
      clearTimeout(escalation.timeoutId);
      this.activeEscalations.delete(ticketId);
      console.log(`⏹️ Stopped escalation monitoring for ticket ${ticketId}`);
    }
  }

  // Utility methods
  private generateTicketNumber(): string {
    const prefix = 'RT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private async addSystemMessage(ticketId: number, content: string) {
    return await this.storage.createSupportMessage({
      ticketId,
      senderId: 0, // System user
      senderType: 'system',
      content,
      createdAt: new Date()
    });
  }

  // Notification methods
  private async notifySupportTeam(type: string, ticket: any) {
    if (this.webSocketService && this.webSocketService.broadcastToRole) {
      this.webSocketService.broadcastToRole('support', {
        type: 'new_support_ticket',
        ticket,
        priority: ticket.priority,
        requiresImmediate: ticket.priority === 'critical'
      });
    }
  }

  private async notifyCustomer(customerId: number, type: string, ticket: any) {
    if (this.webSocketService && this.webSocketService.sendToUser) {
      const notifications = {
        ticket_created: `Your support ticket ${ticket.ticketNumber} has been created. We'll respond based on priority level.`,
        agent_response: `New response received for your ticket ${ticket.ticketNumber}`,
        ticket_resolved: `Your support ticket ${ticket.ticketNumber} has been resolved`
      };

      this.webSocketService.sendToUser(customerId, {
        type: 'support_notification',
        message: notifications[type] || 'Support ticket update',
        ticketNumber: ticket.ticketNumber,
        ticketId: ticket.id
      });
    }
  }

  private async notifyAgent(agentId: number, type: string, ticketId: number) {
    if (this.webSocketService && this.webSocketService.sendToUser) {
      this.webSocketService.sendToUser(agentId, {
        type: 'support_assignment',
        ticketId,
        message: 'New support ticket assigned to you'
      });
    }
  }

  private async notifyEscalation(ticketId: number, level: number, priority: string) {
    const escalationTargets = {
      1: 'support', // Level 1: Support team
      2: 'manager', // Level 2: Support managers
      3: 'admin'    // Level 3: Admin/executives
    };

    const target = escalationTargets[level] || 'admin';
    
    if (this.webSocketService && this.webSocketService.broadcastToRole) {
      this.webSocketService.broadcastToRole(target, {
        type: 'support_escalation',
        ticketId,
        escalationLevel: level,
        priority,
        urgency: level >= 2 ? 'high' : 'medium',
        message: `Ticket ${ticketId} escalated to level ${level} (${priority} priority)`
      });
    }
  }

  private async notifyManagement(ticketId: number, priority: string) {
    if (this.webSocketService && this.webSocketService.broadcastToRole) {
      this.webSocketService.broadcastToRole('admin', {
        type: 'critical_support_escalation',
        ticketId,
        priority,
        message: `URGENT: Ticket ${ticketId} has reached maximum escalation level`,
        requiresImmediateAction: true
      });
    }
  }

  private async notifyTicketUpdate(ticketId: number, update: any) {
    // Broadcast to all users monitoring this ticket
    if (this.webSocketService) {
      const ticket = await this.storage.getSupportTicket(ticketId);
      if (ticket) {
        // Notify customer
        if (ticket.customerId) {
          this.webSocketService.sendToUser(ticket.customerId, {
            type: 'ticket_update',
            ticketId,
            ...update
          });
        }
        
        // Notify assigned agent
        if (ticket.assignedAgentId) {
          this.webSocketService.sendToUser(ticket.assignedAgentId, {
            type: 'ticket_update',
            ticketId,
            ...update
          });
        }
      }
    }
  }

  // Get escalation statistics
  getEscalationStats() {
    const stats = {
      activeEscalations: this.activeEscalations.size,
      byLevel: { 0: 0, 1: 0, 2: 0, 3: 0 },
      nextEscalations: []
    };

    for (const [ticketId, escalation] of this.activeEscalations) {
      stats.byLevel[escalation.escalationLevel]++;
      stats.nextEscalations.push({
        ticketId,
        level: escalation.escalationLevel,
        nextEscalationTime: escalation.nextEscalationTime
      });
    }

    return stats;
  }
}