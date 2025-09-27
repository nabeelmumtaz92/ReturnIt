# ReturnIt Monitoring & Alerts Guide

## Overview
ReturnIt uses comprehensive monitoring to track system health, performance, and business metrics for enterprise-grade reliability.

## Monitoring Architecture

### Core Monitoring Components
- **PerformanceService**: Request/response tracking
- **MonitoringService**: Real-time system metrics
- **HealthCheck**: Database and system status
- **Analytics**: Business metrics and reporting
- **WebSocket Tracking**: Real-time order status

### Monitoring Dashboard
Access: `https://returnit.online/monitoring-dashboard`
- **System Status**: Health, uptime, connectivity
- **Performance Metrics**: Response times, memory usage
- **Business Metrics**: Orders, users, revenue
- **Alert Management**: Active alerts and thresholds

## Tracked Metrics

### System Performance
```typescript
// Automatically tracked via PerformanceService
interface PerformanceMetrics {
  request_time: {
    count: number;
    average: number; // Target: <500ms
    min: number;
    max: number;
  };
  db_query_time: {
    count: number;
    average: number; // Target: <100ms
    min: number;
    max: number;
  };
  memory_usage: {
    heapUsed: number;   // Target: <80% of heapTotal
    heapTotal: number;
    external: number;
    rss: number;
  };
}
```

### Business Metrics
```typescript
// Real-time business tracking
interface BusinessMetrics {
  activeUsers: number;      // Current active sessions
  ordersToday: number;      // Today's order count
  revenueToday: number;     // Today's revenue ($)
  completionRate: number;   // % of successful deliveries
  driverUtilization: number; // % of active drivers
  averageDeliveryTime: number; // Hours from pickup to delivery
}
```

### Infrastructure Metrics
```typescript
// System health indicators
interface SystemHealth {
  uptime: number;           // Seconds since startup
  database: boolean;        // Database connectivity
  websockets: number;       // Active WebSocket connections
  errorRate: number;        // % of requests with errors
  responseTime: number;     // Average response time (ms)
  memoryUsage: number;      // Memory usage percentage
}
```

## Alert Thresholds

### Performance Alerts
```typescript
const defaultThresholds = {
  responseTime: 1000,      // 1 second (WARNING)
  criticalResponseTime: 2000, // 2 seconds (CRITICAL)
  memoryUsage: 80,         // 80% (WARNING)
  criticalMemoryUsage: 90, // 90% (CRITICAL)
  errorRate: 5,            // 5% (WARNING)
  criticalErrorRate: 10,   // 10% (CRITICAL)
  databaseResponseTime: 500, // 500ms (WARNING)
};
```

### Business Alerts
```typescript
const businessThresholds = {
  lowOrderVolume: 10,      // <10 orders/hour during business hours
  highCancellationRate: 20, // >20% cancellation rate
  driverShortage: 5,       // <5 available drivers
  paymentFailures: 3,      // >3% payment failures
  customerComplaints: 5,   // >5 complaints/day
};
```

## Logging System

### Log Locations
```bash
# Application logs
/tmp/logs/Start_application_*.log

# Browser console logs  
/tmp/logs/browser_console_*.log

# Error logs (structured)
server/logs/error.log
server/logs/performance.log
server/logs/business.log
```

### Log Formats
```typescript
// Structured logging format
interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  service: string;
  message: string;
  metadata?: {
    userId?: number;
    orderId?: string;
    driverId?: number;
    responseTime?: number;
    errorStack?: string;
  };
}
```

### Log Retention
- **Application logs**: 7 days local, 30 days archived
- **Error logs**: 30 days local, 90 days archived  
- **Performance logs**: 24 hours high-frequency, 30 days aggregated
- **Business logs**: 1 year retention for analytics

## Alert Types & Responses

### CRITICAL Alerts (Immediate Response Required)

#### Database Down
```typescript
// Trigger conditions
database.healthy === false || database.responseTime > 5000

// Response actions
1. Check database status at status.neon.tech
2. Verify DATABASE_URL environment variable
3. Test connection: psql $DATABASE_URL -c "SELECT 1"
4. Contact Neon support: support@neon.tech
5. Activate backup procedures if needed
```

#### High Error Rate (>10%)
```typescript
// Trigger conditions
errorRate > 10 || criticalErrors > 50/hour

// Response actions
1. Check recent deployments (potential rollback)
2. Review error logs for patterns
3. Monitor user-facing functionality
4. Scale resources if needed
5. Communicate with stakeholders
```

#### Memory Exhaustion (>90%)
```typescript
// Trigger conditions
memoryUsage > 90 || heapUsed/heapTotal > 0.9

// Response actions
1. Clear application caches: PerformanceService.clearCache()
2. Restart application if memory leak suspected
3. Check for runaway processes
4. Scale memory resources
5. Investigate memory leak sources
```

### WARNING Alerts (Monitor & Investigate)

#### Slow Response Times (>1000ms)
```typescript
// Response actions
1. Check PerformanceService.getMetrics() for bottlenecks
2. Review database query performance
3. Monitor concurrent user load
4. Consider caching for heavy operations
5. Scale compute resources if sustained
```

#### High Memory Usage (>80%)
```typescript
// Response actions
1. Monitor trend - is it increasing?
2. Check for memory leaks in recent deployments
3. Clear caches if appropriate
4. Prepare for scaling if trend continues
```

### INFO Alerts (Awareness Only)

#### New Deployment
- Monitor metrics for 30 minutes post-deployment
- Verify key functionality works
- Watch for performance regressions

#### High Traffic
- Scale resources proactively
- Monitor user experience
- Prepare for potential bottlenecks

## Monitoring Tools & Access

### Real-Time Monitoring
```bash
# Access monitoring dashboard
curl https://returnit.online/api/admin/monitoring/metrics
curl https://returnit.online/api/health

# WebSocket monitoring
wscat -c wss://returnit.online/ws/tracking
```

### Performance Analysis
```sql
-- Database performance queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE mean_exec_time > 100 
ORDER BY mean_exec_time DESC;

-- Active connections
SELECT count(*) as active_connections,
       state,
       wait_event
FROM pg_stat_activity 
GROUP BY state, wait_event;
```

### Business Intelligence
```typescript
// Analytics queries
const todayMetrics = await sql`
  SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
    AVG(EXTRACT(EPOCH FROM (actual_delivery_time - created_at))/3600) as avg_delivery_hours
  FROM orders 
  WHERE created_at >= CURRENT_DATE
`;
```

## Alert Notification Channels

### Immediate Notifications (CRITICAL)
- **Console Logs**: Always logged immediately
- **Email**: nabeelmumtaz92@gmail.com (if configured)
- **SMS**: +1-636-254-4821 (if configured)
- **Slack**: #alerts channel (if configured)

### Regular Notifications (WARNING/INFO)
- **Dashboard**: Real-time monitoring dashboard
- **Daily Reports**: Email summary of metrics
- **Weekly Reports**: Business performance summary

### Setting Up Notifications
```typescript
// Configure alert channels in monitoring service
const alertConfig = {
  email: {
    enabled: true,
    recipients: ['nabeelmumtaz92@gmail.com'],
    smtp: process.env.SMTP_CONFIG
  },
  slack: {
    enabled: false, // Configure webhook URL
    webhook: process.env.SLACK_WEBHOOK_URL
  },
  sms: {
    enabled: true,
    number: '+16362544821',
    service: 'twilio' // Configure with Twilio
  }
};
```

## Troubleshooting Common Alerts

### "High Response Time" Alert
1. **Check database**: Query pg_stat_statements for slow queries
2. **Check memory**: Monitor heap usage trends
3. **Check load**: Count active sessions and requests
4. **Check network**: Test connectivity to external services
5. **Scale resources**: Increase compute if sustained high load

### "Database Connection Failed" Alert
1. **Test connection**: `psql $DATABASE_URL -c "SELECT 1"`
2. **Check Neon status**: Visit status.neon.tech
3. **Verify credentials**: Ensure DATABASE_URL is correct
4. **Check firewall**: Verify network connectivity
5. **Contact support**: support@neon.tech for Neon issues

### "Memory Usage High" Alert
1. **Check trends**: Is memory usage increasing over time?
2. **Clear caches**: PerformanceService.clearCache()
3. **Check for leaks**: Monitor after cache clearing
4. **Restart service**: If memory leak is suspected
5. **Scale memory**: Increase container memory allocation

## Performance Baselines

### Normal Operating Ranges
- **Response Time**: 100-500ms average
- **Memory Usage**: 40-70% under normal load
- **Database Queries**: 50-200ms average
- **Error Rate**: <1% of total requests
- **Uptime**: >99.9% monthly

### Peak Load Expectations
- **Black Friday/Peak Season**: 5x normal traffic
- **Business Hours**: 70% of daily traffic (9 AM - 6 PM EST)
- **Weekend Load**: 40% of weekday traffic
- **Order Spikes**: 10x normal during promotions

## Escalation Procedures

### Level 1: Automated Response
- Clear caches
- Restart services (if configured)
- Scale resources automatically

### Level 2: On-Call Engineer
- Investigate alert root cause
- Apply manual fixes
- Communicate status updates

### Level 3: Senior Engineering
- Complex infrastructure issues
- Database emergency procedures
- Architecture decisions

### Level 4: Executive Escalation
- Business-critical outages
- Security incidents
- Major data loss events

## Contact Information

### Primary Contacts
- **Engineering Lead**: nabeelmumtaz92@gmail.com
- **DevOps**: [To be assigned]
- **Business Owner**: [To be assigned]

### External Support
- **Replit Support**: support@replit.com
- **Database (Neon)**: support@neon.tech
- **Payment (Stripe)**: support@stripe.com

### Emergency Contacts
- **24/7 On-call**: [Rotation schedule]
- **Escalation Manager**: [Management contact]
- **Security Incident**: [Security team contact]