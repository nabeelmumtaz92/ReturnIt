# ReturnIt Incident Response Guide

## Overview
This guide provides step-by-step procedures for handling service outages, technical failures, and emergency situations in ReturnIt's infrastructure.

## Incident Classification

### Severity Levels

#### CRITICAL (P0) - Immediate Response Required
**Impact**: Complete service outage or major functionality broken
**Response Time**: 0-15 minutes
**Examples**:
- Website completely inaccessible
- Database connection failure
- Payment processing down
- Security breach detected
- Data loss or corruption

#### HIGH (P1) - Urgent Response Required  
**Impact**: Significant functionality impaired
**Response Time**: 15-60 minutes
**Examples**:
- Major features broken (booking, tracking)
- High error rates (>10%)
- Performance severely degraded
- Driver app not working

#### MEDIUM (P2) - Important Issues
**Impact**: Some functionality affected
**Response Time**: 1-4 hours
**Examples**:
- Minor features broken
- Moderate performance issues
- Non-critical integrations failing
- Monitoring alerts firing

#### LOW (P3) - Minor Issues
**Impact**: Minimal impact on users
**Response Time**: 1-2 business days
**Examples**:
- Cosmetic bugs
- Documentation issues
- Non-urgent feature requests

## Emergency Response Procedures

### Phase 1: Detection & Alert (0-5 minutes)

#### Automated Detection
```typescript
// Monitoring alerts automatically trigger
const alertTriggers = {
  healthCheckFail: 'Health endpoint returns 500+ for 2+ minutes',
  highErrorRate: 'Error rate >10% for 5+ minutes',
  databaseDown: 'Database connection fails',
  memoryExhaustion: 'Memory usage >95% for 3+ minutes',
  responseTimeSlow: 'Average response time >2000ms for 5+ minutes'
};
```

#### Manual Detection
- Customer reports via support channels
- Staff notices issues during testing
- Partner/merchant notifications
- Social media mentions

#### Initial Alert Response
1. **Acknowledge alert** within 5 minutes
2. **Assess severity** using classification above
3. **Notify on-call engineer** if P0/P1
4. **Create incident ticket** with initial assessment

### Phase 2: Initial Assessment (5-15 minutes)

#### Immediate Checks
```bash
# 1. Health check endpoints
curl -f https://returnit.online/api/health
curl -f https://returnit.online/api/admin/monitoring/metrics

# 2. Database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# 3. Key user flows
curl -f https://returnit.online/api/user/orders
curl -f https://returnit.online/api/drivers/active

# 4. External services
curl -f https://api.stripe.com/v1/charges
```

#### Service Status Check
```typescript
// Quick system overview
const systemStatus = {
  webServer: await checkWebServerHealth(),
  database: await checkDatabaseHealth(),
  redis: await checkRedisHealth(),
  stripe: await checkStripeHealth(),
  websockets: await checkWebSocketHealth(),
  monitoring: await checkMonitoringHealth()
};
```

#### Impact Assessment
1. **User impact**: How many users affected?
2. **Business impact**: Revenue/operations affected?
3. **Data integrity**: Any data at risk?
4. **Security impact**: Any security implications?

### Phase 3: Containment & Communication (15-30 minutes)

#### Immediate Containment
```bash
# If runaway process detected
pkill -f "problem-process"

# If memory leak suspected
# Restart application gracefully
npm run restart

# If database issues
# Enable read-only mode if needed
psql $DATABASE_URL -c "ALTER SYSTEM SET default_transaction_read_only = on;"
```

#### Communication Plan
```typescript
// Internal communication
const communicationChannels = {
  engineering: 'Slack #engineering-alerts',
  management: 'Email to leadership team',
  support: 'Update support team chat',
  external: 'Status page updates'
};

// Customer communication timeline
const communicationSchedule = {
  immediate: 'Internal team notification',
  '15min': 'Status page update if customer-facing',
  '30min': 'Customer email if major outage',
  '60min': 'Social media update if needed',
  'hourly': 'Progress updates until resolved'
};
```

#### Status Page Updates
- **Initial**: "We're investigating reports of issues with [service]"
- **Identified**: "We've identified the issue and are working on a fix"
- **Fix deployed**: "A fix has been deployed and we're monitoring"
- **Resolved**: "The issue has been resolved"

### Phase 4: Investigation & Resolution (30+ minutes)

#### Diagnostic Commands
```bash
# System performance
top -p $(pgrep node)
free -h
df -h

# Application logs
tail -f /tmp/logs/Start_application_*.log
grep -i error /tmp/logs/*.log

# Database performance
psql $DATABASE_URL -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC 
LIMIT 10;
"

# Network connectivity
ping google.com
nslookup returnit.online
```

#### Common Resolution Steps

##### Database Issues
```bash
# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql $DATABASE_URL -c "
SELECT query, query_start, state 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';
"

# Kill long-running queries if needed
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE ..."

# Restart database connection pool
# Application restart may be required
```

##### Memory Issues
```bash
# Clear application caches
curl -X POST https://returnit.online/api/admin/cache/clear

# Restart application if memory leak
pm2 restart all  # If using PM2
# Or restart via Replit interface

# Monitor memory after restart
watch -n 5 'free -h && echo "---" && ps aux | grep node'
```

##### Performance Issues
```bash
# Check for CPU bottlenecks
htop

# Check for I/O bottlenecks
iotop

# Analyze slow API endpoints
grep "in [1-9][0-9][0-9][0-9]ms" /tmp/logs/*.log | head -20

# Scale resources if needed
# Upgrade Replit plan or optimize code
```

### Phase 5: Recovery Verification (After fix)

#### Verification Checklist
```bash
# 1. Health checks pass
curl -f https://returnit.online/api/health

# 2. Key user flows work
# Test order creation, driver assignment, payment

# 3. Performance metrics normal
curl https://returnit.online/api/admin/monitoring/metrics

# 4. Error rates back to normal
# Check monitoring dashboard

# 5. No alerts firing
# Verify monitoring system shows green
```

#### User Communication
```typescript
// Resolution announcement
const resolutionMessage = {
  channels: ['status_page', 'email', 'social_media'],
  message: `
The issue affecting [service] has been resolved at ${new Date()}.
All services are now operating normally.
We apologize for any inconvenience caused.
  `,
  includePostmortem: true // For P0/P1 incidents
};
```

## Service Restart Procedures

### Application Restart
```bash
# Graceful restart via Replit
# 1. Stop current workflow
# 2. Start workflow again
# 3. Monitor startup logs

# Emergency restart
pkill -f node
npm run dev

# Verify restart
curl -f https://returnit.online/api/health
```

### Database Connection Reset
```typescript
// Reset database connection pool
async function resetDatabaseConnections() {
  try {
    // Close existing connections
    await sql.end();
    
    // Reinitialize connection pool
    await initializeDatabase();
    
    // Test connection
    await sql`SELECT 1`;
    
    console.log('✅ Database connections reset successfully');
  } catch (error) {
    console.error('❌ Failed to reset database connections:', error);
    throw error;
  }
}
```

### WebSocket Service Restart
```typescript
// Restart WebSocket service
function restartWebSocketService() {
  // Gracefully close existing connections
  webSocketService.cleanup();
  
  // Reinitialize service
  webSocketService = new WebSocketService();
  webSocketService.start();
  
  console.log('✅ WebSocket service restarted');
}
```

## Rollback Procedures

### Application Rollback
```bash
# Via Replit deployment interface
# 1. Go to Deployments tab
# 2. Select previous stable deployment
# 3. Click "Promote to Live"

# Via git (if deployed via Git)
git log --oneline -10  # Find last stable commit
git checkout <stable-commit-hash>
git push origin main --force  # Deploy rollback
```

### Database Rollback
⚠️ **CRITICAL**: Database rollbacks can cause data loss
```bash
# 1. STOP all write operations immediately
curl -X POST https://returnit.online/api/admin/maintenance/readonly

# 2. Backup current state
pg_dump $DATABASE_URL > emergency_backup.sql

# 3. Restore from backup (if safe to do so)
psql $DATABASE_URL < previous_backup.sql

# 4. Verify data integrity
psql $DATABASE_URL -c "SELECT count(*) FROM orders;"

# 5. Resume write operations
curl -X POST https://returnit.online/api/admin/maintenance/readwrite
```

### Configuration Rollback
```bash
# Revert environment variables
# Update .env file or Replit secrets
# Restart application to load changes

# Revert feature flags
curl -X POST https://returnit.online/api/admin/features/disable \
  -d '{"feature": "problematic_feature"}'
```

## Escalation Procedures

### Internal Escalation

#### Level 1: On-Call Engineer (0-30 minutes)
- **Response**: Immediate assessment and initial fixes
- **Authority**: Restart services, clear caches, basic troubleshooting
- **Escalate if**: Issue not resolved in 30 minutes (P0) or 2 hours (P1)

#### Level 2: Senior Engineering (30+ minutes)
- **Response**: Advanced debugging and architecture decisions
- **Authority**: Code changes, database modifications, infrastructure changes
- **Escalate if**: Requires business decisions or major architecture changes

#### Level 3: Engineering Management (1+ hours)
- **Response**: Resource allocation and strategic decisions
- **Authority**: Budget approval, vendor escalation, communication decisions
- **Escalate if**: Requires executive decisions or legal/compliance issues

#### Level 4: Executive Team (2+ hours or data breach)
- **Response**: Business continuity and crisis management
- **Authority**: Customer communication, media response, legal decisions

### External Escalation

#### Replit Support
```bash
# Contact methods
Email: support@replit.com
Community: community.replit.com
Status: status.replit.com

# Information to provide
- Replit workspace name
- Error messages and logs
- Steps to reproduce
- Impact assessment
```

#### Database Support (Neon)
```bash
# Contact methods
Email: support@neon.tech
Discord: discord.gg/neon
Status: status.neon.tech

# Information to provide
- Database endpoint
- Error messages
- Query performance issues
- Connection problems
```

#### Payment Support (Stripe)
```bash
# Contact methods
Email: support@stripe.com
Phone: Emergency hotline for P0 incidents
Dashboard: Live chat in Stripe dashboard

# Information to provide
- Account ID
- Transaction IDs
- Error codes
- Impact on payments
```

## Business Continuity

### Essential Services Priority
1. **Customer order creation** - Core business function
2. **Driver order acceptance** - Operations continuation
3. **Payment processing** - Revenue protection
4. **Order tracking** - Customer satisfaction
5. **Admin dashboard** - Management oversight

### Disaster Recovery
```typescript
// Recovery time objectives (RTO) and recovery point objectives (RPO)
const recoveryObjectives = {
  customerFacing: {
    RTO: '15 minutes',  // Max downtime
    RPO: '5 minutes',   // Max data loss
    priority: 'critical'
  },
  adminFunctions: {
    RTO: '4 hours',
    RPO: '1 hour', 
    priority: 'important'
  },
  reporting: {
    RTO: '24 hours',
    RPO: '4 hours',
    priority: 'normal'
  }
};
```

### Communication Templates

#### Internal Alert Template
```
🚨 INCIDENT ALERT 🚨
Severity: [P0/P1/P2/P3]
Service: [Affected service]
Impact: [User impact description]
Started: [Timestamp]
Engineer: [Assigned engineer]
Status: [Investigating/Fixing/Resolved]
ETA: [Expected resolution time]
```

#### Customer Communication Template
```
We're currently experiencing issues with [service].
We're actively working on a resolution.
Estimated fix time: [ETA]
We'll update you as soon as it's resolved.
Sorry for any inconvenience.
```

## Post-Incident Procedures

### Immediate Follow-up (0-24 hours)
1. **Service verification**: Confirm all systems stable
2. **Data integrity check**: Verify no data corruption
3. **Performance monitoring**: Watch for recurring issues
4. **Customer satisfaction**: Monitor support channels

### Post-Mortem (Within 48 hours)
```typescript
interface PostMortem {
  incident: {
    title: string;
    severity: string;
    duration: string;
    impactedUsers: number;
  };
  timeline: {
    detected: Date;
    acknowledged: Date;
    resolved: Date;
    keyEvents: Array<{time: Date, event: string}>;
  };
  rootCause: string;
  contributing factors: string[];
  resolution: string;
  preventionMeasures: string[];
  actionItems: Array<{
    task: string;
    owner: string;
    dueDate: Date;
  }>;
}
```

### Lessons Learned
1. **What went well?** - Effective response procedures
2. **What could be improved?** - Process gaps identified
3. **Action items** - Specific improvements with owners
4. **Monitoring enhancements** - New alerts or dashboards
5. **Documentation updates** - Update runbooks and procedures

## Emergency Contacts

### Primary On-Call
- **Engineering Lead**: nabeelmumtaz92@gmail.com
- **Backup Engineer**: [To be assigned]
- **Business Owner**: [To be assigned]

### External Support
- **Replit Support**: support@replit.com
- **Neon Database**: support@neon.tech  
- **Stripe Payments**: support@stripe.com
- **DNS Provider**: [Provider support]

### Management Escalation
- **Engineering Manager**: [To be assigned]
- **CTO/Technical Lead**: [To be assigned]  
- **CEO/Business Owner**: [To be assigned]

### 24/7 Emergency Line
- **Primary**: +1-636-254-4821
- **Backup**: [Secondary contact]
- **Escalation**: [Management contact]

---

**Remember**: Stay calm, communicate clearly, and follow procedures. Document everything for post-incident analysis.