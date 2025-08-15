import { storage } from "./storage";
import { PerformanceService } from "./performance";

export interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  activeDrivers: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  customerSatisfaction: number;
  orderTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  driverMetrics: Array<{
    driverId: number;
    name: string;
    completedOrders: number;
    earnings: number;
    rating: number;
  }>;
  regionalData: Array<{
    region: string;
    orders: number;
    revenue: number;
  }>;
  performanceMetrics: any;
}

export class AdvancedAnalytics {
  // Generate comprehensive business intelligence report
  static async generateBusinessReport(): Promise<AnalyticsData> {
    const cacheKey = 'business_report_v2';
    
    return PerformanceService.withCache(cacheKey, async () => {
      const startTime = Date.now();
      
      try {
        // Parallel data fetching for better performance
        const [
          allOrders,
          allUsers,
          completedOrders,
        ] = await Promise.all([
          storage.getAllOrders(),
          storage.getAllUsers(),
          storage.getOrdersByStatus?.('completed') || [],
        ]);

        // Calculate key metrics
        const totalOrders = allOrders.length;
        const totalCompleted = completedOrders.length;
        const completionRate = totalOrders > 0 ? (totalCompleted / totalOrders) * 100 : 0;

        // Revenue calculations
        const totalRevenue = completedOrders.reduce((sum: number, order: any) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        const averageOrderValue = totalCompleted > 0 ? totalRevenue / totalCompleted : 0;

        // Driver metrics
        const drivers = allUsers.filter((user: any) => user.role === 'driver');
        const activeDrivers = drivers.filter((driver: any) => {
          // Count drivers with orders in last 30 days
          const recentOrders = allOrders.filter((order: any) => 
            order.driverId === driver.id && 
            new Date(order.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          );
          return recentOrders.length > 0;
        }).length;

        // Order trends (last 30 days)
        const orderTrends = this.calculateOrderTrends(completedOrders);

        // Driver performance metrics
        const driverMetrics = this.calculateDriverMetrics(drivers, completedOrders);

        // Regional analysis
        const regionalData = this.calculateRegionalData(completedOrders);

        // Customer satisfaction (from ratings)
        const customerSatisfaction = this.calculateCustomerSatisfaction(completedOrders);

        // Performance metrics from PerformanceService
        const performanceMetrics = PerformanceService.getMetrics();

        const report: AnalyticsData = {
          totalOrders,
          completedOrders: totalCompleted,
          activeDrivers,
          totalRevenue,
          averageOrderValue,
          completionRate,
          customerSatisfaction,
          orderTrends,
          driverMetrics,
          regionalData,
          performanceMetrics,
        };

        // Track report generation time
        PerformanceService.trackMetric('report_generation', Date.now() - startTime);

        return report;
      } catch (error) {
        console.error('Error generating business report:', error);
        throw error;
      }
    }, 1000 * 60 * 10); // Cache for 10 minutes
  }

  // Calculate order trends for charts
  private static calculateOrderTrends(orders: any[]): Array<{date: string, orders: number, revenue: number}> {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayOrders = orders.filter(order => 
        order.updatedAt.toISOString().split('T')[0] === date
      );
      
      return {
        date,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      };
    });
  }

  // Calculate driver performance metrics
  private static calculateDriverMetrics(drivers: any[], completedOrders: any[]): Array<{driverId: number, name: string, completedOrders: number, earnings: number, rating: number}> {
    return drivers.map(driver => {
      const driverOrders = completedOrders.filter(order => order.driverId === driver.id);
      const totalEarnings = driverOrders.reduce((sum, order) => 
        sum + ((order.totalAmount || 0) * 0.7), 0
      ); // 70% driver cut

      const ratings = driverOrders
        .filter(order => order.driverRating)
        .map(order => order.driverRating);
      
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      return {
        driverId: driver.id,
        name: driver.fullName || driver.email,
        completedOrders: driverOrders.length,
        earnings: totalEarnings,
        rating: Math.round(averageRating * 100) / 100,
      };
    }).sort((a, b) => b.completedOrders - a.completedOrders);
  }

  // Calculate regional performance data
  private static calculateRegionalData(orders: any[]): Array<{region: string, orders: number, revenue: number}> {
    const regionMap = new Map<string, {orders: number, revenue: number}>();

    orders.forEach(order => {
      // Extract city/region from pickup address (simplified)
      const region = this.extractRegion(order.pickupStreetAddress || 'Unknown');
      
      if (!regionMap.has(region)) {
        regionMap.set(region, { orders: 0, revenue: 0 });
      }
      
      const data = regionMap.get(region)!;
      data.orders += 1;
      data.revenue += order.totalAmount || 0;
    });

    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      ...data,
    })).sort((a, b) => b.orders - a.orders);
  }

  // Extract region from address (simplified implementation)
  private static extractRegion(address: string): string {
    // Simple extraction - in real app, use geocoding service
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || 'St. Louis';
  }

  // Calculate customer satisfaction from ratings
  private static calculateCustomerSatisfaction(orders: any[]): number {
    const ratingsData = orders
      .filter(order => order.driverRating && order.driverRating > 0)
      .map(order => order.driverRating);

    if (ratingsData.length === 0) return 0;

    const average = ratingsData.reduce((sum, rating) => sum + rating, 0) / ratingsData.length;
    return Math.round(average * 100) / 100;
  }

  // Export data for Excel/CSV
  static async generateExportData(format: 'excel' | 'csv' = 'excel'): Promise<any> {
    const report = await this.generateBusinessReport();
    
    const exportData = {
      summary: {
        'Total Orders': report.totalOrders,
        'Completed Orders': report.completedOrders,
        'Active Drivers': report.activeDrivers,
        'Total Revenue': `$${report.totalRevenue.toFixed(2)}`,
        'Average Order Value': `$${report.averageOrderValue.toFixed(2)}`,
        'Completion Rate': `${report.completionRate.toFixed(1)}%`,
        'Customer Satisfaction': `${report.customerSatisfaction}/5`,
      },
      orderTrends: report.orderTrends,
      driverMetrics: report.driverMetrics,
      regionalData: report.regionalData,
      performanceMetrics: report.performanceMetrics,
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return exportData;
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use proper CSV library
    const csvLines: string[] = [];
    
    Object.entries(data).forEach(([section, sectionData]) => {
      csvLines.push(`\n--- ${section.toUpperCase()} ---`);
      
      if (Array.isArray(sectionData)) {
        if (sectionData.length > 0) {
          const headers = Object.keys(sectionData[0]);
          csvLines.push(headers.join(','));
          sectionData.forEach(row => {
            csvLines.push(headers.map(header => row[header] || '').join(','));
          });
        }
      } else {
        Object.entries(sectionData as object).forEach(([key, value]) => {
          csvLines.push(`${key},${value}`);
        });
      }
    });
    
    return csvLines.join('\n');
  }

  // Real-time metrics for dashboard
  static async getRealTimeMetrics(): Promise<any> {
    const cacheKey = 'realtime_metrics';
    
    return PerformanceService.withCache(cacheKey, async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const [todayOrders, activeOrders] = await Promise.all([
        storage.getAllOrders().then(orders => 
          orders.filter(order => order.createdAt.toISOString().split('T')[0] === today)
        ),
        storage.getAllOrders().then(orders =>
          orders.filter(order => ['pending', 'assigned', 'picked_up'].includes(order.status))
        ),
      ]);

      return {
        todayOrders: todayOrders.length,
        activeOrders: activeOrders.length,
        todayRevenue: todayOrders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        systemHealth: PerformanceService.getHealthStats(),
        lastUpdated: now.toISOString(),
      };
    }, 1000 * 30); // Cache for 30 seconds for real-time feel
  }
}