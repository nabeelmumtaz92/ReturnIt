import { storage } from './storage';
import { webSocketService } from './websocket-service';
import { webhookService } from './webhook-service';
import type { Order, User, Location } from '@shared/schema';

interface DriverScore {
  driverId: number;
  driver: User;
  score: number;
  distance: number;
  estimatedTime: number;
  currentLoad: number;
  factors: {
    distanceScore: number;
    ratingScore: number;
    loadScore: number;
    experienceScore: number;
    incentiveScore: number;
  };
}

interface AutoAssignmentConfig {
  maxAssignmentRadius: number; // kilometers
  maxDriverLoad: number; // max simultaneous orders per driver
  preferredDriverLoad: number; // optimal load for efficiency
  maxAssignmentAttempts: number;
  assignmentTimeoutMinutes: number;
  routeOptimizationEnabled: boolean;
}

class AutoAssignmentService {
  private config: AutoAssignmentConfig = {
    maxAssignmentRadius: 25, // 25km max radius for assignments
    maxDriverLoad: 3, // max 3 orders per driver for quality
    preferredDriverLoad: 2, // optimal is 2 orders for efficiency
    maxAssignmentAttempts: 5,
    assignmentTimeoutMinutes: 10,
    routeOptimizationEnabled: true
  };

  private assignmentQueue: Map<string, NodeJS.Timeout> = new Map();
  private performanceMetrics = {
    totalAssignments: 0,
    successfulAssignments: 0,
    averageAssignmentTime: 0,
    driverUtilization: 0,
    customerSatisfaction: 0
  };

  /**
   * AUTO-ASSIGN ORDER WHEN CREATED
   * This is the main entry point for operational scale
   */
  async autoAssignOrder(order: Order): Promise<boolean> {
    try {
      console.log(`🤖 Starting auto-assignment for order ${order.id}`);
      this.performanceMetrics.totalAssignments++;
      const startTime = Date.now();

      // Get order pickup location for distance calculations
      const pickupLocation: Location = {
        lat: 0, 
        lng: 0,
        timestamp: new Date().toISOString(),
        accuracy: 100
      };

      // Parse pickup coordinates if available
      if (order.pickupCoordinates && typeof order.pickupCoordinates === 'object') {
        const coords = order.pickupCoordinates as any;
        pickupLocation.lat = coords.lat || coords.latitude || 0;
        pickupLocation.lng = coords.lng || coords.longitude || 0;
      }

      // Find and score all available drivers
      const driverScores = await this.findOptimalDrivers(order, pickupLocation);
      
      if (driverScores.length === 0) {
        console.log(`❌ No available drivers found for order ${order.id}`);
        return false;
      }

      // Try to assign to the best drivers in order
      for (let i = 0; i < Math.min(driverScores.length, this.config.maxAssignmentAttempts); i++) {
        const driverScore = driverScores[i];
        const assigned = await this.attemptDriverAssignment(order, driverScore);
        
        if (assigned) {
          const assignmentTime = Date.now() - startTime;
          this.updatePerformanceMetrics(assignmentTime, true);
          
          console.log(`✅ Auto-assigned order ${order.id} to driver ${driverScore.driverId} (score: ${driverScore.score.toFixed(2)})`);
          
          // Fire webhook for assignment
          await webhookService.fireReturnAssigned(order, driverScore.driverId);
          
          return true;
        }
      }

      console.log(`⚠️ Failed to auto-assign order ${order.id} after ${this.config.maxAssignmentAttempts} attempts`);
      this.updatePerformanceMetrics(Date.now() - startTime, false);
      return false;

    } catch (error) {
      console.error(`❌ Error in auto-assignment for order ${order.id}:`, error);
      return false;
    }
  }

  /**
   * FIND OPTIMAL DRIVERS WITH ROUTE OPTIMIZATION
   * Scales operations by intelligently matching drivers to orders
   */
  private async findOptimalDrivers(order: Order, pickupLocation: Location): Promise<DriverScore[]> {
    try {
      // Get all available drivers within radius
      const availableDrivers = await this.getAvailableDriversInRadius(pickupLocation, this.config.maxAssignmentRadius);
      
      if (availableDrivers.length === 0) {
        return [];
      }

      // Score each driver for this order
      const driverScores: DriverScore[] = [];
      
      for (const driver of availableDrivers) {
        const score = await this.calculateDriverScore(driver, order, pickupLocation);
        if (score.score > 0) {
          driverScores.push(score);
        }
      }

      // Sort by score (highest first) for optimal assignment
      return driverScores.sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error('Error finding optimal drivers:', error);
      return [];
    }
  }

  /**
   * CALCULATE DRIVER SCORE FOR OPERATIONAL EFFICIENCY
   * Factors: distance, rating, current load, experience, incentives
   */
  private async calculateDriverScore(driver: User, order: Order, pickupLocation: Location): Promise<DriverScore> {
    try {
      // Get driver's current location
      const driverLocation = driver.currentLocation || { lat: 0, lng: 0, timestamp: new Date().toISOString(), accuracy: 100 };
      
      // Calculate distance and estimated time
      const distance = this.calculateDistance(driverLocation, pickupLocation);
      const estimatedTime = this.estimateDeliveryTime(distance);

      // Get driver's current workload
      const currentOrders = await storage.getDriverOrders(driver.id);
      const currentLoad = currentOrders.filter(o => ['assigned', 'picked_up', 'en_route'].includes(o.status)).length;

      // Calculate individual scoring factors
      const distanceScore = this.calculateDistanceScore(distance);
      const ratingScore = this.calculateRatingScore(driver.driverRating || 3.0);
      const loadScore = this.calculateLoadScore(currentLoad);
      const experienceScore = this.calculateExperienceScore(driver.completedDeliveries || 0);
      const incentiveScore = await this.calculateIncentiveScore(driver, order);

      // Weighted composite score for operational optimization
      const score = (
        distanceScore * 0.35 +      // Distance is most important for efficiency
        ratingScore * 0.25 +        // Quality matters for customer satisfaction  
        loadScore * 0.20 +          // Load balancing for scale
        experienceScore * 0.15 +    // Experience reduces issues
        incentiveScore * 0.05       // Incentives for motivation
      );

      return {
        driverId: driver.id,
        driver,
        score,
        distance,
        estimatedTime,
        currentLoad,
        factors: {
          distanceScore,
          ratingScore,
          loadScore,
          experienceScore,
          incentiveScore
        }
      };

    } catch (error) {
      console.error(`Error calculating score for driver ${driver.id}:`, error);
      return {
        driverId: driver.id,
        driver,
        score: 0,
        distance: 999,
        estimatedTime: 999,
        currentLoad: 999,
        factors: {
          distanceScore: 0,
          ratingScore: 0,
          loadScore: 0,
          experienceScore: 0,
          incentiveScore: 0
        }
      };
    }
  }

  /**
   * DISTANCE-BASED SCORING FOR ROUTE OPTIMIZATION
   */
  private calculateDistanceScore(distance: number): number {
    if (distance > this.config.maxAssignmentRadius) return 0;
    // Inverse score: closer = higher score (0-1 scale)
    return Math.max(0, (this.config.maxAssignmentRadius - distance) / this.config.maxAssignmentRadius);
  }

  /**
   * DRIVER RATING SCORING FOR QUALITY SCALE
   */
  private calculateRatingScore(rating: number): number {
    // Convert 1-5 rating to 0-1 score
    return Math.max(0, (rating - 1) / 4);
  }

  /**
   * LOAD BALANCING SCORING FOR OPERATIONAL SCALE
   */
  private calculateLoadScore(currentLoad: number): number {
    if (currentLoad >= this.config.maxDriverLoad) return 0;
    if (currentLoad <= this.config.preferredDriverLoad) return 1;
    
    // Decreasing score as load increases beyond preferred
    return Math.max(0, (this.config.maxDriverLoad - currentLoad) / (this.config.maxDriverLoad - this.config.preferredDriverLoad));
  }

  /**
   * EXPERIENCE SCORING FOR RELIABILITY SCALE
   */
  private calculateExperienceScore(completedDeliveries: number): number {
    // Logarithmic scoring: diminishing returns after 50 deliveries
    return Math.min(1, Math.log(completedDeliveries + 1) / Math.log(51));
  }

  /**
   * INCENTIVE SCORING FOR DRIVER MOTIVATION
   */
  private async calculateIncentiveScore(driver: User, order: Order): Promise<number> {
    try {
      // Calculate potential bonuses for this order
      const bonuses = await storage.calculateOrderBonuses(order, driver);
      // Higher bonuses = higher incentive score (normalized)
      return Math.min(1, bonuses / 10); // $10+ bonus = max score
    } catch (error) {
      return 0.5; // Default incentive score
    }
  }

  /**
   * ATTEMPT DRIVER ASSIGNMENT WITH TIMEOUT
   */
  private async attemptDriverAssignment(order: Order, driverScore: DriverScore): Promise<boolean> {
    try {
      // Create driver assignment with calculated timeout
      const assignment = await storage.createDriverOrderAssignment({
        orderId: order.id,
        driverId: driverScore.driverId,
        assignmentType: 'auto_assign',
        assignmentPriority: Math.round(driverScore.score * 10), // 0-10 priority
        offerExpiresAt: new Date(Date.now() + this.config.assignmentTimeoutMinutes * 60 * 1000),
        driverLocation: driverScore.driver.currentLocation || null,
        // estimatedDeliveryTime: new Date(Date.now() + driverScore.estimatedTime * 60 * 1000), // Not in schema
        metadata: {
          autoAssigned: true,
          driverScore: driverScore.score,
          scoringFactors: driverScore.factors,
          estimatedDistance: driverScore.distance
        }
      });

      // Update order status to assigned
      await storage.updateOrder(order.id, {
        status: 'assigned',
        driverId: driverScore.driverId,
        driverAssignedAt: new Date()
      });

      // Broadcast assignment to driver via WebSocket
      webSocketService.broadcastToDriver(driverScore.driverId, {
        type: 'order_assignment',
        assignment,
        order,
        expiresAt: assignment.offerExpiresAt,
        score: driverScore.score,
        estimatedEarnings: await storage.calculateOrderBonuses(order, driverScore.driver)
      });

      // Schedule timeout handling
      this.scheduleAssignmentTimeout(assignment.id, order.id, driverScore.driverId);

      return true;

    } catch (error) {
      console.error(`Error attempting assignment to driver ${driverScore.driverId}:`, error);
      return false;
    }
  }

  /**
   * UTILITY FUNCTIONS FOR OPERATIONAL SCALE
   */
  private async getAvailableDriversInRadius(location: Location, radiusKm: number): Promise<User[]> {
    // Get all online drivers
    const allDrivers = await storage.getDrivers(true);
    
    // Filter by distance and availability
    return allDrivers.filter(driver => {
      if (!driver.isOnline || !driver.currentLocation) return false;
      
      const distance = this.calculateDistance(driver.currentLocation, location);
      return distance <= radiusKm;
    });
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLon = this.toRadians(loc2.lng - loc1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateDeliveryTime(distance: number): number {
    // Estimate in minutes: 30 km/h average speed + 15 min pickup/dropoff
    return Math.round((distance / 30) * 60 + 15);
  }

  private scheduleAssignmentTimeout(assignmentId: number, orderId: string, driverId: number): void {
    const timeoutId = setTimeout(async () => {
      console.log(`⏰ Assignment timeout for order ${orderId}, driver ${driverId}`);
      this.assignmentQueue.delete(orderId);
      
      // Handle timeout - this will trigger reassignment
      // The existing detectDriverAbandonmentAndExpiredAssignments function will pick this up
    }, this.config.assignmentTimeoutMinutes * 60 * 1000);

    this.assignmentQueue.set(orderId, timeoutId);
  }

  private updatePerformanceMetrics(assignmentTime: number, success: boolean): void {
    if (success) {
      this.performanceMetrics.successfulAssignments++;
    }
    
    // Update average assignment time
    const totalTime = this.performanceMetrics.averageAssignmentTime * (this.performanceMetrics.totalAssignments - 1) + assignmentTime;
    this.performanceMetrics.averageAssignmentTime = totalTime / this.performanceMetrics.totalAssignments;
  }

  /**
   * GET PERFORMANCE METRICS FOR OPERATIONAL MONITORING
   */
  public getPerformanceMetrics() {
    const successRate = this.performanceMetrics.totalAssignments > 0 
      ? (this.performanceMetrics.successfulAssignments / this.performanceMetrics.totalAssignments) * 100
      : 0;

    return {
      ...this.performanceMetrics,
      successRate,
      queueLength: this.assignmentQueue.size
    };
  }

  /**
   * UPDATE CONFIGURATION FOR OPERATIONAL TUNING
   */
  public updateConfig(newConfig: Partial<AutoAssignmentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Auto-assignment configuration updated:', this.config);
  }

  /**
   * CLEANUP ON SHUTDOWN
   */
  public cleanup(): void {
    const timeouts = Array.from(this.assignmentQueue.values());
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.assignmentQueue.clear();
  }
}

export const autoAssignmentService = new AutoAssignmentService();
export default autoAssignmentService;