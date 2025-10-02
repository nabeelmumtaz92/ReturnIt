# ReturnIt Migration to Production Infrastructure
**Date**: October 2, 2025

## Overview
This guide walks you through migrating ReturnIt from Replit to a production-grade infrastructure using:
- **Supabase** (PostgreSQL database + auth)
- **Google Cloud Run** (backend API hosting)
- **Vercel** (frontend hosting)
- **UptimeRobot** (monitoring)

## Prerequisites

### Accounts Needed
- [ ] Supabase account: https://supabase.com/
- [ ] Google Cloud account: https://console.cloud.google.com/
- [ ] GitHub account: https://github.com/
- [ ] Vercel account: https://vercel.com/signup
- [ ] UptimeRobot account: https://uptimerobot.com/

### Tools Needed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] gcloud CLI installed: https://cloud.google.com/sdk/docs/install

## Step 1: Set Up Supabase (Database)

### 1.1 Create Supabase Project
1. Go to https://supabase.com/
2. Click **New Project**
3. Choose a name: `returnit-production`
4. Choose region closest to your users (e.g., `us-east-1`)
5. Set a strong database password
6. Wait for project provisioning (~2 minutes)

### 1.2 Get API Credentials
1. Go to **Project Settings → API**
2. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET - backend only)
   ```

### 1.3 Run Migration SQL
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `supabase-migration.sql`
4. Paste and click **Run**
5. Verify tables created in **Table Editor**

### 1.4 Import Existing Data (Optional)
Export from Replit PostgreSQL:
```bash
# On Replit, export your data
pg_dump $DATABASE_URL > returnit_backup.sql

# Import to Supabase (get connection string from Supabase Settings → Database)
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < returnit_backup.sql
```

Or use CSV import in Supabase Table Editor.

## Step 2: Deploy Backend to Google Cloud Run

### 2.1 Set Up Google Cloud Project
```bash
# Login to gcloud
gcloud auth login

# Create new project or use existing
gcloud projects create returnit-prod --name="ReturnIt Production"

# Set active project
gcloud config set project returnit-prod

# Enable required services
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 2.2 Update Configuration Files
Edit `deploy-cloud-run.sh`:
```bash
PROJECT_ID="returnit-prod"  # Your actual GCP project ID
```

Edit `set-env-vars.sh` with your actual values:
```bash
SUPABASE_URL="https://xxxxx.supabase.co"  # From Step 1.2
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."   # From Step 1.2
STRIPE_SECRET_KEY="sk_live_..."           # Your Stripe key
GOOGLE_CLIENT_ID="..."                    # Your Google OAuth
GOOGLE_CLIENT_SECRET="..."                # Your Google OAuth
OPENAI_API_KEY="sk-..."                   # Your OpenAI key
```

### 2.3 Deploy Backend
```bash
# Make scripts executable
chmod +x deploy-cloud-run.sh set-env-vars.sh

# Deploy
./deploy-cloud-run.sh

# Set environment variables
./set-env-vars.sh

# Get your Cloud Run URL
gcloud run services describe returnit-backend --region us-central1 --format 'value(status.url)'
# Example output: https://returnit-backend-xxxxx-uc.a.run.app
```

### 2.4 Test Backend
```bash
# Test health endpoint
curl https://YOUR_CLOUD_RUN_URL/api/health

# Should return: {"ok":true,"ts":"2025-10-02T..."}
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Push Code to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Migration to production infrastructure"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/returnit-frontend.git
git branch -M main
git push -u origin main
```

### 3.2 Import to Vercel
1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `returnit-frontend` repo
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables
In Vercel dashboard → **Settings → Environment Variables**, add:
```
VITE_API_BASE_URL = https://YOUR_CLOUD_RUN_URL
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci... (anon key from Step 1.2)
```

### 3.4 Deploy
1. Click **Deploy**
2. Wait for deployment (~2 minutes)
3. You'll get a URL like: `https://returnit-production.vercel.app`

### 3.5 Configure Custom Domain (Optional)
1. In Vercel → **Settings → Domains**
2. Add `returnit.online`
3. Update DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Step 4: Set Up Monitoring (UptimeRobot)

### 4.1 Create Monitors
1. Go to https://uptimerobot.com/
2. Click **Add New Monitor**
3. Create monitor for frontend:
   - **Type**: HTTP(s)
   - **URL**: `https://returnit.online` (or your Vercel URL)
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: Your email

4. Create monitor for backend:
   - **Type**: HTTP(s)
   - **URL**: `https://YOUR_CLOUD_RUN_URL/api/health`
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: Your email

### 4.2 Set Up Alerts
1. Go to **My Settings → Alert Contacts**
2. Add email and/or SMS contacts
3. Configure alerts for downtime

## Step 5: Cutover to Production

### 5.1 Pre-Cutover Checklist
- [ ] Backend deployed and responding to `/api/health`
- [ ] Database migrated with all data
- [ ] Frontend deployed and loading
- [ ] All environment variables set
- [ ] Monitoring configured
- [ ] Backups created

### 5.2 Execute Cutover
1. **Update DNS** (if using custom domain):
   - Point `returnit.online` to Vercel
   - Wait for DNS propagation (5-30 minutes)

2. **Test Everything**:
   ```bash
   # Test frontend
   curl https://returnit.online

   # Test API
   curl https://returnit.online/api/health

   # Test database (login and create an order)
   ```

3. **Monitor**: Watch UptimeRobot for 24 hours

### 5.3 Rollback Plan (If Needed)
If anything goes wrong:
1. Revert DNS back to Replit
2. Use Supabase backup to restore data
3. Debug issues before re-attempting

## Step 6: Post-Migration

### 6.1 Update GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for auto-deployment:
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: returnit-prod
      - run: gcloud builds submit --tag gcr.io/returnit-prod/returnit-backend
      - run: gcloud run deploy returnit-backend --image gcr.io/returnit-prod/returnit-backend --region us-central1
```

### 6.2 Cost Monitoring
- **Supabase**: Free tier (500MB database, 50K requests/month)
- **Google Cloud Run**: Free tier (2M requests/month, 360K GB-seconds)
- **Vercel**: Free tier (100GB bandwidth, unlimited sites)
- **UptimeRobot**: Free tier (50 monitors, 5-min intervals)

Monitor usage in each dashboard.

## Troubleshooting

### Backend won't start
- Check Cloud Run logs: `gcloud run services logs read returnit-backend --region us-central1`
- Verify environment variables are set
- Check database connection string

### Frontend can't connect to API
- Verify `VITE_API_BASE_URL` is set in Vercel
- Check CORS settings in backend
- Ensure Cloud Run allows unauthenticated requests

### Database connection fails
- Check Supabase connection string
- Verify service role key is correct
- Check firewall/network settings

## Support Links
- **Supabase Docs**: https://supabase.com/docs
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Vercel Docs**: https://vercel.com/docs
- **UptimeRobot Docs**: https://blog.uptimerobot.com/getting-started/

## Success Criteria
- ✅ Frontend loads at returnit.online
- ✅ Users can log in and create orders
- ✅ Backend API responds to requests
- ✅ Database queries working
- ✅ Monitoring alerts configured
- ✅ No errors in logs for 24 hours

---

**Estimated Migration Time**: 2-4 hours
**Recommended Time**: Weekend or off-peak hours
**Risk Level**: Medium (test thoroughly before cutting over)

Good luck! 🚀
