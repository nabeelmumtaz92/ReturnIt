// Live Order Assignment Service with 60-second window and priority system
// Implements: proximity → rating → first-come priority system

import { sql } from "drizzle-orm";

interface OrderLocation {
  lat: number;
  lng: number;
}

interface AssignmentWindow {
  orderId: string;
  assignedDrivers: number[];
  assignmentStartTime: Date;
  timeoutId: NodeJS.Timeout;
  currentPriorityLevel: number; // 0=proximity, 1=rating, 2=all
}

export class LiveOrderAssignmentService {
  private activeAssignments = new Map<string, AssignmentWindow>();

  constructor(private storage: any, private webSocketService: any) {}

  // Priority-based driver assignment: proximity → rating → first-come
  async assignOrderToDrivers(orderId: string, orderLocation?: OrderLocation) {
    try {
      console.log(`🚀 Starting live assignment for order ${orderId}`);
      
      // Get available drivers and sort by priority
      const availableDrivers = await this.findAvailableDriversForOrder(orderId, orderLocation);
      
      if (availableDrivers.length === 0) {
        console.log(`⚠️ No available drivers for order ${orderId}`);
        await this.escalateToSupport(orderId, 'no_available_drivers');
        return false;
      }

      // Start with highest priority drivers (proximity-based)
      const proximityDrivers = this.sortDriversByProximity(availableDrivers, orderLocation);
      
      return await this.startAssignmentWindow(orderId, proximityDrivers, 0);
    } catch (error) {
      console.error(`❌ Error in live order assignment for ${orderId}:`, error);
      return false;
    }
  }

  // Start 60-second assignment window with specific drivers
  private async startAssignmentWindow(orderId: string, drivers: any[], priorityLevel: number) {
    const assignmentStartTime = new Date();
    
    // Send WebSocket notifications to drivers
    await this.notifyDriversOfNewOrder(orderId, drivers);
    
    // Update order status to indicate assignment in progress
    await this.storage.updateOrder(orderId, {
      status: 'finding_driver',
      statusHistory: sql`array_append(status_history, ${JSON.stringify({
        status: 'finding_driver',
        timestamp: assignmentStartTime.toISOString(),
        priorityLevel,
        driverCount: drivers.length,
        note: `Assignment window started with ${drivers.length} drivers (priority level ${priorityLevel})`
      })})`
    });
    
    // Create assignment tracking with 60-second timeout
    const timeoutId = setTimeout(() => {
      this.handleAssignmentTimeout(orderId, priorityLevel);
    }, 60000); // 60 seconds as specified by user

    this.activeAssignments.set(orderId, {
      orderId,
      assignedDrivers: drivers.map(d => d.id),
      assignmentStartTime,
      timeoutId,
      currentPriorityLevel: priorityLevel
    });

    console.log(`⏰ Assignment window started for order ${orderId} with ${drivers.length} drivers (priority level ${priorityLevel})`);
    return true;
  }

  // Handle driver acceptance
  async handleDriverAcceptance(orderId: string, driverId: number) {
    const assignment = this.activeAssignments.get(orderId);
    
    if (!assignment) {
      console.log(`⚠️ No active assignment found for order ${orderId}`);
      return { success: false, message: 'Assignment window expired' };
    }

    if (!assignment.assignedDrivers.includes(driverId)) {
      console.log(`⚠️ Driver ${driverId} not eligible for order ${orderId}`);
      return { success: false, message: 'Not authorized for this order' };
    }

    // Driver accepted - update order and cancel timeout
    clearTimeout(assignment.timeoutId);
    this.activeAssignments.delete(orderId);

    // Update order with driver assignment and 2-hour completion deadline
    const acceptedAt = new Date();
    const completionDeadline = new Date(acceptedAt.getTime() + (2 * 60 * 60 * 1000)); // 2 hours

    await this.storage.updateOrder(orderId, {
      driverId,
      status: 'assigned',
      driverAssignedAt: acceptedAt,
      driverAcceptedAt: acceptedAt,
      completionDeadline,
      statusHistory: sql`array_append(status_history, ${JSON.stringify({
        status: 'assigned',
        timestamp: acceptedAt.toISOString(),
        driverId,
        completionDeadline: completionDeadline.toISOString(),
        note: 'Driver accepted order - 2 hour completion window started'
      })})`
    });

    // Notify all other drivers order is no longer available
    await this.notifyDriversOrderTaken(orderId, assignment.assignedDrivers.filter(id => id !== driverId));

    // Send customer notification
    await this.notifyCustomerDriverAssigned(orderId, driverId);

    console.log(`✅ Order ${orderId} assigned to driver ${driverId} with 2-hour deadline: ${completionDeadline.toISOString()}`);
    return { 
      success: true, 
      message: 'Order assigned successfully', 
      driverId, 
      completionDeadline: completionDeadline.toISOString(),
      timeline: {
        acceptedAt: acceptedAt.toISOString(),
        completionDeadline: completionDeadline.toISOString(),
        timeRemaining: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      }
    };
  }

  // Handle 60-second timeout
  private async handleAssignmentTimeout(orderId: string, currentPriorityLevel: number) {
    const assignment = this.activeAssignments.get(orderId);
    if (!assignment) return;

    console.log(`⏰ Assignment timeout for order ${orderId} at priority level ${currentPriorityLevel}`);
    
    // Clean up current assignment
    this.activeAssignments.delete(orderId);

    // Try next priority level as specified: proximity → rating → first-come
    if (currentPriorityLevel < 2) {
      await this.escalateToPriorityLevel(orderId, currentPriorityLevel + 1);
    } else {
      // All priority levels exhausted - escalate to support
      console.log(`❌ All drivers exhausted for order ${orderId} - escalating to support`);
      await this.escalateToSupport(orderId, 'no_driver_acceptance');
    }
  }

  // Escalate to next priority level
  private async escalateToPriorityLevel(orderId: string, priorityLevel: number) {
    try {
      const order = await this.storage.getOrder(orderId);
      if (!order) return;

      const orderLocation = order.pickupCoordinates;
      const allDrivers = await this.findAvailableDriversForOrder(orderId, orderLocation);

      let drivers: any[] = [];
      let description = '';
      
      switch (priorityLevel) {
        case 1: // Rating-based priority
          drivers = this.sortDriversByRating(allDrivers);
          description = 'rating-based assignment';
          console.log(`📈 Escalating order ${orderId} to rating-based assignment`);
          break;
        case 2: // First-come-first-served (all drivers)
          drivers = allDrivers;
          description = 'first-come-first-served';
          console.log(`🏃 Escalating order ${orderId} to first-come-first-served`);
          break;
      }

      if (drivers.length > 0) {
        await this.startAssignmentWindow(orderId, drivers, priorityLevel);
      } else {
        await this.escalateToSupport(orderId, 'no_available_drivers');
      }
    } catch (error) {
      console.error(`❌ Error escalating order ${orderId}:`, error);
      await this.escalateToSupport(orderId, 'system_error');
    }
  }

  // Sort drivers by proximity to pickup location (top 5 closest)
  private sortDriversByProximity(drivers: any[], orderLocation?: OrderLocation) {
    if (!orderLocation) return drivers.slice(0, 5);

    return drivers
      .map(driver => {
        const driverLocation = driver.currentLocation;
        if (!driverLocation) return { ...driver, distance: Infinity };

        const distance = this.calculateDistance(
          orderLocation.lat, orderLocation.lng,
          driverLocation.lat, driverLocation.lng
        );
        
        return { ...driver, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 closest drivers as specified
  }

  // Sort drivers by rating (top 10 rated)
  private sortDriversByRating(drivers: any[]) {
    return drivers
      .sort((a, b) => (b.driverRating || 5.0) - (a.driverRating || 5.0))
      .slice(0, 10); // Top 10 rated drivers
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Find available drivers for a given order
  private async findAvailableDriversForOrder(
    orderId: string,
    orderLocation?: OrderLocation
  ): Promise<any[]> {
    try {
      const driversData = await this.storage.getAvailableDrivers();
      
      if (!driversData || driversData.length === 0) {
        console.log(`⚠️ No available drivers found for order ${orderId}`);
        return [];
      }

      // Get online, active, approved drivers
      const availableDrivers = driversData.filter(driver => 
        driver.isOnline && 
        driver.isActive &&
        (driver.applicationStatus === 'approved_active' || driver.applicationStatus === 'approved')
      );

      console.log(`🚗 Found ${availableDrivers.length} available drivers for order ${orderId}`);
      return availableDrivers;

    } catch (error) {
      console.error(`❌ Error finding available drivers for order ${orderId}:`, error);
      return [];
    }
  }

  // WebSocket notifications for real-time updates
  private async notifyDriversOfNewOrder(orderId: string, drivers: any[]) {
    const order = await this.storage.getOrder(orderId);
    if (!order) return;

    const notification = {
      type: 'new_order_available',
      orderId,
      orderData: {
        pickupAddress: `${order.pickupStreetAddress}, ${order.pickupCity}`,
        retailer: order.retailer,
        itemDescription: order.itemDescription,
        totalPrice: order.totalPrice,
        estimatedDuration: '45-60 min',
        expiresAt: new Date(Date.now() + 60000).toISOString(), // 60 seconds
        priority: order.priority || 'standard'
      }
    };

    // Send to drivers via WebSocket
    drivers.forEach(driver => {
      if (this.webSocketService && this.webSocketService.sendToUser) {
        this.webSocketService.sendToUser(driver.id, notification);
      }
    });

    console.log(`📢 Notified ${drivers.length} drivers about new order ${orderId}`);
  }

  private async notifyDriversOrderTaken(orderId: string, driverIds: number[]) {
    const notification = {
      type: 'order_no_longer_available',
      orderId,
      message: 'Another driver has accepted this order'
    };

    driverIds.forEach(driverId => {
      if (this.webSocketService && this.webSocketService.sendToUser) {
        this.webSocketService.sendToUser(driverId, notification);
      }
    });

    console.log(`📢 Notified ${driverIds.length} drivers that order ${orderId} was taken`);
  }

  private async notifyCustomerDriverAssigned(orderId: string, driverId: number) {
    const driver = await this.storage.getUser(driverId);
    const order = await this.storage.getOrder(orderId);
    
    if (driver && order) {
      const notification = {
        type: 'driver_assigned',
        orderId,
        driver: {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          rating: driver.driverRating,
          vehicleInfo: `${driver.vehicleColor || ''} ${driver.vehicleMake || ''} ${driver.vehicleModel || ''}`.trim(),
          phone: driver.phone // For customer contact
        },
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min estimate
      };
      
      if (this.webSocketService && this.webSocketService.sendToUser) {
        this.webSocketService.sendToUser(order.userId, notification);
      }

      console.log(`📢 Notified customer ${order.userId} that driver ${driverId} was assigned to order ${orderId}`);
    }
  }

  private async escalateToSupport(orderId: string, reason: string) {
    console.log(`🚨 Escalating order ${orderId} to support: ${reason}`);
    
    await this.storage.updateOrder(orderId, {
      status: 'support_required',
      statusHistory: sql`array_append(status_history, ${JSON.stringify({
        status: 'support_required',
        timestamp: new Date().toISOString(),
        reason,
        note: 'Order escalated to support - automatic assignment failed'
      })})`
    });

    // Notify support team via WebSocket if available
    if (this.webSocketService && this.webSocketService.broadcastToRole) {
      this.webSocketService.broadcastToRole('support', {
        type: 'support_escalation',
        orderId,
        reason,
        message: `Order ${orderId} requires manual driver assignment`
      });
    }
  }

  // Cancel active assignment (for manual intervention)
  cancelAssignment(orderId: string) {
    const assignment = this.activeAssignments.get(orderId);
    if (assignment) {
      clearTimeout(assignment.timeoutId);
      this.activeAssignments.delete(orderId);
      console.log(`🛑 Cancelled active assignment for order ${orderId}`);
      return true;
    }
    return false;
  }

  // Get active assignment status
  getAssignmentStatus(orderId: string) {
    const assignment = this.activeAssignments.get(orderId);
    if (!assignment) return null;

    return {
      orderId: assignment.orderId,
      assignedDrivers: assignment.assignedDrivers,
      startTime: assignment.assignmentStartTime,
      priorityLevel: assignment.currentPriorityLevel,
      timeRemaining: 60000 - (Date.now() - assignment.assignmentStartTime.getTime())
    };
  }
}