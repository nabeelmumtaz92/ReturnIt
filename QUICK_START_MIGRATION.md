# ReturnIt Migration - Quick Start
**Ready to deploy in 30 minutes!**

## ⚡ Fast Track (Copy & Paste Commands)

### 1️⃣ Supabase Setup (5 minutes)
1. Go to: https://supabase.com/
2. Create project → Wait for provisioning
3. SQL Editor → Paste `supabase-migration.sql` → Run
4. Settings → API → Copy these:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   SUPABASE_ANON_KEY=eyJ...
   ```

### 2️⃣ Google Cloud Setup (10 minutes)
```bash
# Install gcloud: https://cloud.google.com/sdk/docs/install

# Login and configure
gcloud auth login
gcloud projects create returnit-prod --name="ReturnIt Production"
gcloud config set project returnit-prod

# Enable services
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Edit deploy-cloud-run.sh: Replace YOUR_GCP_PROJECT_ID with "returnit-prod"
# Edit set-env-vars.sh: Add your Supabase URLs and API keys

# Deploy backend
chmod +x deploy-cloud-run.sh set-env-vars.sh
./deploy-cloud-run.sh
./set-env-vars.sh

# Get URL
gcloud run services describe returnit-backend --region us-central1 --format 'value(status.url)'
```

### 3️⃣ Vercel Setup (10 minutes)
```bash
# Push to GitHub first
git add .
git commit -m "Production migration"
git push origin main

# Then:
# 1. Go to: https://vercel.com/new
# 2. Import your GitHub repo
# 3. Add environment variables:
#    VITE_API_BASE_URL = https://YOUR_CLOUD_RUN_URL
#    VITE_SUPABASE_URL = https://xxxxx.supabase.co
#    VITE_SUPABASE_ANON_KEY = eyJ...
# 4. Deploy
# 5. Optional: Add custom domain returnit.online
```

### 4️⃣ UptimeRobot Setup (5 minutes)
1. Go to: https://uptimerobot.com/
2. Add monitor: `https://returnit.online` (or Vercel URL)
3. Add monitor: `https://YOUR_CLOUD_RUN_URL/api/health`
4. Set alert email

## ✅ Verification Checklist
```bash
# Test backend
curl https://YOUR_CLOUD_RUN_URL/api/health
# Expected: {"ok":true,"ts":"2025-10-02..."}

# Test frontend
curl https://returnit.online
# Expected: HTML response

# Test full stack
# 1. Open https://returnit.online
# 2. Create account
# 3. Book an order
# 4. Check Supabase → Table Editor → orders table
```

## 📋 Before You Start - Get These Ready:
- [ ] Supabase account
- [ ] Google Cloud account (with billing enabled for free tier)
- [ ] GitHub repo for your code
- [ ] Vercel account
- [ ] UptimeRobot account
- [ ] Stripe API keys
- [ ] Google OAuth credentials
- [ ] OpenAI API key

## 🆘 Quick Fixes

### "gcloud: command not found"
Install: https://cloud.google.com/sdk/docs/install

### "Permission denied on deploy-cloud-run.sh"
```bash
chmod +x deploy-cloud-run.sh set-env-vars.sh
```

### "Database connection error"
Check your `SUPABASE_SERVICE_ROLE_KEY` in set-env-vars.sh

### "CORS error in browser"
Update `CORS_ORIGIN` in set-env-vars.sh with your Vercel URL

## 💰 Cost Estimate
- **Free Tier Limits** (all platforms):
  - Supabase: 500MB DB, 50K requests/month
  - Cloud Run: 2M requests/month
  - Vercel: 100GB bandwidth
  - UptimeRobot: 50 monitors

- **Expected Costs** (if exceeding free tier):
  - ~$0-20/month for moderate traffic
  - ~$20-100/month for high traffic

## 📞 Need Help?
- **Supabase**: https://supabase.com/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **Vercel**: https://vercel.com/docs

---

**Total Time**: ~30 minutes  
**Difficulty**: Medium  
**Reversible**: Yes (keep Replit running as backup)

🚀 **Let's go!**
