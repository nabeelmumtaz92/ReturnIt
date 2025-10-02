# 🚀 Deploy ReturnIt - Copy & Paste Commands

**Total Time:** 30 minutes  
**Your Files Ready:** ✅ Database export, Docker config, deployment scripts

---

## Option 1: Fully Automated (Recommended) ⚡

```bash
# Make script executable
chmod +x deploy-automated.sh

# Run the automated deployment
./deploy-automated.sh
```

The script will ask you for:
- Google Cloud Project ID
- Supabase credentials
- API keys (Stripe, Google, OpenAI, PayPal)

It will automatically:
1. ✅ Import database to Supabase
2. ✅ Setup Google Cloud project
3. ✅ Build and deploy backend to Cloud Run
4. ✅ Configure all environment variables
5. ✅ Test the backend
6. ✅ Give you Vercel deployment instructions

---

## Option 2: Manual Step-by-Step

### Step 1: Supabase Database (5 min)
```bash
# 1. Create Supabase project: https://supabase.com/
# 2. Go to SQL Editor
# 3. Run this file: supabase-migration.sql
# 4. Import your data:
psql "YOUR_SUPABASE_CONNECTION_STRING" < replit_database_export.sql
```

### Step 2: Google Cloud Backend (10 min)
```bash
# Login and configure
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Deploy
chmod +x deploy-cloud-run.sh set-env-vars.sh
./deploy-cloud-run.sh
./set-env-vars.sh

# Get your backend URL
gcloud run services describe returnit-backend --region us-central1 --format 'value(status.url)'
```

### Step 3: Vercel Frontend (10 min)
```bash
# 1. Push to GitHub
git add .
git commit -m "Production migration"
git push origin main

# 2. Import to Vercel: https://vercel.com/new
# 3. Add environment variables (see .env.example)
# 4. Deploy
```

### Step 4: Monitoring (5 min)
```bash
# Setup UptimeRobot: https://uptimerobot.com/
# Add monitors for:
#   - Frontend: https://returnit.online
#   - Backend: https://YOUR_CLOUD_RUN_URL/api/health
```

---

## 📋 What You Need Ready

Before starting, have these ready:

### Accounts
- [ ] Supabase account (free tier)
- [ ] Google Cloud account (billing enabled for free tier)
- [ ] Vercel account (free tier)
- [ ] GitHub account

### API Keys
- [ ] Stripe Secret Key (from https://dashboard.stripe.com/apikeys)
- [ ] Google OAuth (from https://console.cloud.google.com/apis/credentials)
- [ ] OpenAI API Key (from https://platform.openai.com/api-keys)
- [ ] PayPal credentials (from https://developer.paypal.com/dashboard)

### Tools Installed
```bash
# Check if you have these installed:
node --version   # Should be 18+
git --version
gcloud --version  # Install: https://cloud.google.com/sdk/docs/install
```

---

## ✅ Verification Checklist

After deployment, test:

```bash
# 1. Backend health check
curl https://YOUR_CLOUD_RUN_URL/api/health
# Expected: {"ok":true,"ts":"2025-10-02..."}

# 2. Frontend loads
curl https://returnit.online
# Expected: HTML response

# 3. Full stack test
# - Open https://returnit.online
# - Create an account
# - Book an order
# - Check Supabase Table Editor → orders table
```

---

## 🆘 Quick Fixes

### "gcloud: command not found"
```bash
# Install gcloud CLI: https://cloud.google.com/sdk/docs/install
```

### "Permission denied on script"
```bash
chmod +x deploy-automated.sh deploy-cloud-run.sh set-env-vars.sh
```

### "Database connection error"
```bash
# Check your DATABASE_URL in Supabase Settings → Database
# Use the pooler connection string for serverless
```

### "CORS error in browser"
```bash
# Update CORS_ORIGIN in Cloud Run environment variables:
gcloud run services update returnit-backend \
  --region us-central1 \
  --set-env-vars "CORS_ORIGIN=https://returnit.online,https://YOUR-VERCEL-URL.vercel.app"
```

---

## 💰 Cost Estimate

All services have generous free tiers:

- **Supabase:** 500MB DB, 50K requests/month (FREE)
- **Cloud Run:** 2M requests/month (FREE)
- **Vercel:** 100GB bandwidth (FREE)
- **UptimeRobot:** 50 monitors (FREE)

**Expected cost for moderate traffic:** $0-20/month

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Vercel Docs:** https://vercel.com/docs

---

## 🎯 Ready to Start?

### Fastest Path (30 minutes):
```bash
chmod +x deploy-automated.sh
./deploy-automated.sh
```

Then follow the on-screen instructions!

**Good luck! 🚀**
