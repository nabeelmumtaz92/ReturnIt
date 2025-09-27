# ReturnIt Database Guide

## Overview
ReturnIt uses **PostgreSQL** hosted on **Neon** (serverless Postgres) with Drizzle ORM for type-safe database operations.

## Database Architecture

### Connection Details
```bash
# Development Database
DATABASE_URL=postgresql://user:pass@ep-example-123.us-east-1.aws.neon.tech/returnit_dev

# Production Database  
DATABASE_URL=postgresql://user:pass@ep-example-456.us-east-1.aws.neon.tech/returnit_prod
```

### Core Tables
- **users**: Customer and driver accounts
- **orders**: Return/exchange requests
- **driver_assignments**: Order-driver relationships
- **order_status_history**: Status tracking
- **driver_location_pings**: GPS tracking
- **merchant_policies**: Return policy data
- **driver_payouts**: Payment tracking

## Connecting to PostgreSQL

### Via Replit (Recommended)
```typescript
// Database connection is auto-configured
import { sql } from './server/db.js';

// Run queries
const result = await sql`SELECT * FROM users LIMIT 10`;
```

### Direct Connection Tools
```bash
# psql command line
psql $DATABASE_URL

# pgAdmin connection
Host: ep-example-123.us-east-1.aws.neon.tech
Database: returnit_dev
Username: [from DATABASE_URL]
Password: [from DATABASE_URL]
SSL Mode: require
```

### Connection Health Check
```typescript
// Check database connectivity
import { checkDatabaseHealth } from './server/db.js';

const health = await checkDatabaseHealth();
console.log(health);
// { healthy: true, responseTime: 45, connectionType: 'HTTP (stateless)' }
```

## Schema Management

### Drizzle ORM Schema
```typescript
// shared/schema.ts - Single source of truth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  // ... other fields
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  // ... other fields
});
```

### Schema Migrations
```bash
# Apply schema changes (SAFE)
npm run db:push

# Force push (if conflicts)
npm run db:push --force

# Generate migration files (optional)
npx drizzle-kit generate:pg
```

⚠️ **CRITICAL**: Never manually edit migrations. Always use `npm run db:push --force`

## Backup & Restore

### Automated Backups (Neon)
- **Frequency**: Daily automated backups
- **Retention**: 7 days for free tier, 30 days for paid
- **Point-in-time**: Available with Neon Pro

### Manual Backup
```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema-only backup
pg_dump $DATABASE_URL --schema-only > schema_backup.sql

# Data-only backup
pg_dump $DATABASE_URL --data-only > data_backup.sql
```

### Restore from Backup
```bash
# Restore full database
psql $DATABASE_URL < backup_20250127_143022.sql

# Restore specific table
pg_restore $DATABASE_URL -t orders backup.sql
```

### Database Cloning (Neon)
```bash
# Create database branch for testing
curl -X POST \
  https://console.neon.tech/api/v2/projects/PROJECT_ID/branches \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{"name": "test-branch", "parent_id": "main"}'
```

## Monitoring Database Health

### Performance Metrics
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long running queries
SELECT query, query_start, state, wait_event 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';

-- Database size
SELECT pg_size_pretty(pg_database_size('returnit_prod'));

-- Table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Health Check Queries
```typescript
// Automated health monitoring
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await sql`SELECT 1`;
    const duration = Date.now() - start;
    
    return {
      healthy: true,
      responseTime: duration,
      connectionType: 'HTTP (stateless)'
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}
```

## Query Optimization

### Performance Best Practices
```sql
-- Use indexes for frequent queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_driver_assignments_order_id ON driver_assignments(order_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'created';
```

### Connection Pooling
```typescript
// Optimized database configuration
export const dbConfig = {
  max: 20,        // Maximum connections
  min: 2,         // Minimum connections  
  idle: 30000,    // Close after 30s idle
  acquire: 60000, // Max time to get connection
};
```

### Query Caching
```typescript
// Use PerformanceService for caching
import { PerformanceService } from './performance.js';

// Cache expensive queries
const cachedResult = await PerformanceService.withCache(
  'expensive_query_key',
  () => sql`SELECT * FROM complex_view`,
  300000 // 5 minute cache
);
```

## Data Integrity & Security

### Access Control
```sql
-- Database user permissions (Neon manages this)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO returnit_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO returnit_app;
```

### Data Validation
```typescript
// Drizzle Zod schemas for validation
import { createInsertSchema } from 'drizzle-zod';

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Validate before database operations
const validatedUser = insertUserSchema.parse(userData);
```

### Sensitive Data Protection
- **Password hashing**: bcrypt with salt rounds
- **PII encryption**: Consider encryption for sensitive fields
- **Connection security**: All connections use TLS/SSL

## Replication & High Availability

### Neon Features
- **Read replicas**: Available in Neon Pro
- **Multi-region**: Automatic failover capabilities
- **Compute scaling**: Auto-pause/resume based on activity

### Monitoring Replication
```sql
-- Check replication lag (if using replicas)
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn
FROM pg_stat_replication;
```

## Troubleshooting Common Issues

### Connection Problems
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check SSL requirements
psql "$DATABASE_URL?sslmode=require" -c "SELECT 1;"
```

### Performance Issues
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check locks
SELECT * FROM pg_locks WHERE NOT granted;
```

### Schema Issues
```bash
# Reset local schema to match production
npm run db:pull  # Pull schema from database
npm run db:push  # Push local schema to database
```

## Emergency Procedures

### Database Recovery
1. **Assess damage**: Identify affected tables/data
2. **Stop writes**: Temporarily disable write operations
3. **Restore backup**: Use most recent backup
4. **Verify integrity**: Run data consistency checks
5. **Resume operations**: Gradually restore write access

### Contact Information
- **Neon Support**: support@neon.tech
- **Emergency**: Discord.gg/neon (community)
- **Status Page**: status.neon.tech
- **Documentation**: neon.tech/docs

### Critical Contacts
- **Database Admin**: nabeelmumtaz92@gmail.com
- **DevOps Lead**: [To be assigned]
- **On-call Engineer**: [Rotation schedule]