# ReturnIt Deployment Guide

## Overview
ReturnIt follows a modern deployment pipeline: **Replit → GitHub → Cloud Production**

## Development to Production Flow

### 1. Replit Development
- All development happens in Replit workspace
- Local testing with `npm run dev` on port 5000
- Database: Development Postgres (Neon-backed)
- Real-time features via WebSocket service

### 2. Code Management
```bash
# Push changes to GitHub
git add .
git commit -m "Feature: description"
git push origin main
```

### 3. Production Deployment Options

#### Option A: Replit Publishing (Recommended)
```bash
# Use Replit's built-in deployment
npm run build
# Click "Publish" in Replit interface
# Automatic deployment to .replit.app domain
```

#### Option B: External Cloud (Advanced)
- **Google Cloud Run**: Containerized deployment
- **AWS Fargate**: Serverless containers
- **Vercel/Netlify**: Frontend deployment

## Triggering a Redeploy

### Via Replit
1. Click **"Publish"** button in Replit
2. Select deployment configuration
3. Monitor deployment logs
4. Test deployed URL

### Via Cloud Provider
```bash
# Google Cloud Run
gcloud run deploy returnit-app \
  --source . \
  --platform managed \
  --region us-central1

# AWS Fargate (via CDK/Terraform)
cdk deploy ReturnItStack
```

### Via CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloud Run
        run: gcloud run deploy --source .
```

## Rolling Back Deployments

### Replit Rollback
1. Go to **Deployments** tab
2. Select previous successful deployment
3. Click **"Promote to Live"**
4. Verify rollback success

### Cloud Provider Rollback
```bash
# Google Cloud Run - Rollback to revision
gcloud run services update-traffic returnit-app \
  --to-revisions=returnit-app-00001-abc=100

# AWS Fargate - Rollback via service update
aws ecs update-service \
  --cluster returnit-cluster \
  --service returnit-service \
  --task-definition returnit-app:5
```

### Emergency Rollback Checklist
1. **Identify Issue**: Check logs, monitoring alerts
2. **Database State**: Ensure DB compatibility with previous version
3. **Execute Rollback**: Use platform-specific commands
4. **Verify Health**: Check /api/health endpoint
5. **Monitor**: Watch error rates, performance metrics
6. **Communicate**: Update stakeholders on status

## Database Migrations During Deployment

### Safe Deployment Process
```bash
# 1. Test schema changes locally
npm run db:push

# 2. Backup production database
pg_dump $DATABASE_URL > backup.sql

# 3. Deploy with schema sync
npm run db:push --force  # Production schema sync

# 4. Verify application health
curl https://your-app.com/api/health
```

### Rollback with Database Changes
⚠️ **CRITICAL**: Schema changes may prevent rollback
- **Forward-only migrations**: Design schema changes to be backward-compatible
- **Database backups**: Always backup before deployment
- **Gradual rollout**: Use feature flags for major changes

## Environment Configuration

### Production Environment Variables
```bash
# Required for production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/returnit_prod
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=AIza...

# Security
SESSION_SECRET=random-256-bit-string
CORS_ORIGIN=https://returnit.online

# Performance
DB_POOL_SIZE=20
CACHE_TTL=300
```

### Health Check Verification
```bash
# Test deployment health
curl -f https://returnit.online/api/health
curl -f https://returnit.online/api/admin/monitoring/metrics
```

## Troubleshooting Common Issues

### Build Failures
- **Node version**: Ensure Node.js 18+ in production
- **Dependencies**: Check package.json and package-lock.json
- **Memory limits**: Increase container memory for large builds

### Database Connection Issues
- **Connection strings**: Verify DATABASE_URL format
- **SSL requirements**: Production databases often require SSL
- **Connection pooling**: Tune pool size for production load

### Performance Issues
- **Static assets**: Ensure CDN/caching for assets
- **Database queries**: Monitor slow query logs
- **Memory usage**: Check for memory leaks in monitoring

## Monitoring Deployment Success

### Key Metrics to Watch
- **Response times**: < 500ms average
- **Error rates**: < 1% 4xx/5xx responses
- **Database health**: Connection pool status
- **Memory usage**: < 80% of allocated memory

### Deployment Verification Checklist
- [ ] Health check returns 200 OK
- [ ] Database connectivity confirmed
- [ ] Key user flows working (booking, tracking)
- [ ] Payment processing functional
- [ ] WebSocket connections working
- [ ] Monitoring alerts not firing

## Support Contacts

### Replit Support
- **Platform issues**: support@replit.com
- **Deployment help**: community.replit.com

### Cloud Provider Support
- **Google Cloud**: Google Cloud Support Console
- **AWS**: AWS Support Center
- **Database (Neon)**: support@neon.tech

### Emergency Escalation
1. **Primary**: Check monitoring dashboard
2. **Secondary**: Review deployment logs
3. **Escalate**: Contact cloud provider support
4. **Critical**: Activate incident response team