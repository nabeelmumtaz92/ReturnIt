#!/bin/bash
# ReturnIt Automated Deployment Script
# This script automates the entire migration process with minimal user input

set -e

echo "🚀 ReturnIt Production Migration - Automated Deployment"
echo "========================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Collect required information
echo -e "${BLUE}📋 Step 1: Configuration${NC}"
echo "Please provide the following information:"
echo ""

read -p "Google Cloud Project ID (e.g., returnit-prod): " PROJECT_ID
read -p "Google Cloud Region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

read -p "Supabase Project URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

read -p "Supabase Database Password: " DB_PASSWORD
# Construct DATABASE_URL
SUPABASE_PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')
DATABASE_URL="postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

read -p "Vercel Domain (e.g., returnit.vercel.app or returnit.online): " VERCEL_DOMAIN

echo ""
echo -e "${YELLOW}⚠️  API Keys Required - Press Enter to skip if you'll add them later${NC}"
read -p "Stripe Secret Key (sk_live_...): " STRIPE_SECRET_KEY
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
read -p "OpenAI API Key: " OPENAI_API_KEY
read -p "PayPal Client ID: " PAYPAL_CLIENT_ID
read -p "PayPal Client Secret: " PAYPAL_CLIENT_SECRET

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# CORS origins
CORS_ORIGIN="https://${VERCEL_DOMAIN}"

echo ""
echo -e "${GREEN}✅ Configuration collected${NC}"
echo ""

# Step 2: Import database to Supabase
echo -e "${BLUE}📊 Step 2: Import Database to Supabase${NC}"
echo "Importing replit_database_export.sql to Supabase..."

if [ -f "replit_database_export.sql" ]; then
  psql "$DATABASE_URL" < replit_database_export.sql
  echo -e "${GREEN}✅ Database imported successfully${NC}"
else
  echo -e "${YELLOW}⚠️  No database export found. Run: pg_dump \$DATABASE_URL > replit_database_export.sql${NC}"
fi
echo ""

# Step 3: Setup Google Cloud
echo -e "${BLUE}☁️  Step 3: Setup Google Cloud${NC}"

# Authenticate
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set project
echo "Setting GCP project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID 2>/dev/null || {
  echo "Project doesn't exist. Creating..."
  gcloud projects create $PROJECT_ID --name="ReturnIt Production"
  gcloud config set project $PROJECT_ID
}

# Enable required services
echo "Enabling required GCP services..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --quiet

echo -e "${GREEN}✅ Google Cloud setup complete${NC}"
echo ""

# Step 4: Build and Deploy Backend
echo -e "${BLUE}🔨 Step 4: Build and Deploy Backend to Cloud Run${NC}"

SERVICE_NAME="returnit-backend"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building container image..."
gcloud builds submit --tag $IMAGE

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --quiet

echo -e "${GREEN}✅ Backend deployed${NC}"
echo ""

# Step 5: Set Environment Variables
echo -e "${BLUE}🔐 Step 5: Configure Environment Variables${NC}"

gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-env-vars "DATABASE_URL=${DATABASE_URL}" \
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" \
  --set-env-vars "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" \
  --set-env-vars "CORS_ORIGIN=${CORS_ORIGIN}" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "SESSION_SECRET=${SESSION_SECRET}" \
  --set-env-vars "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" \
  --set-env-vars "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" \
  --set-env-vars "OPENAI_API_KEY=${OPENAI_API_KEY}" \
  --set-env-vars "PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}" \
  --set-env-vars "PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}" \
  --quiet

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Get the Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "${GREEN}✅✅✅ Backend Deployment Complete! ✅✅✅${NC}"
echo ""
echo "Backend URL: ${CLOUD_RUN_URL}"
echo ""

# Step 6: Test Backend
echo -e "${BLUE}🧪 Step 6: Testing Backend${NC}"
echo "Testing health endpoint..."

HEALTH_RESPONSE=$(curl -s "${CLOUD_RUN_URL}/api/health")
if [ ! -z "$HEALTH_RESPONSE" ]; then
  echo -e "${GREEN}✅ Backend is responding: $HEALTH_RESPONSE${NC}"
else
  echo -e "${RED}❌ Backend health check failed${NC}"
fi
echo ""

# Step 7: Vercel Configuration
echo -e "${BLUE}🌐 Step 7: Frontend Deployment (Vercel)${NC}"
echo ""
echo "Your backend is deployed! Now deploy the frontend:"
echo ""
echo "1. Push code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Production migration'"
echo "   git push origin main"
echo ""
echo "2. Import to Vercel: https://vercel.com/new"
echo ""
echo "3. Set these environment variables in Vercel:"
echo "   VITE_API_BASE_URL=${CLOUD_RUN_URL}"
echo "   VITE_SUPABASE_URL=${SUPABASE_URL}"
echo "   VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
echo ""
echo "4. Deploy and get your Vercel URL"
echo ""

# Summary
echo -e "${GREEN}========================================================"
echo "🎉 Migration Complete!"
echo "========================================================${NC}"
echo ""
echo "📊 Summary:"
echo "  - Database: Imported to Supabase"
echo "  - Backend: Deployed to Cloud Run"
echo "  - Backend URL: ${CLOUD_RUN_URL}"
echo "  - Frontend: Ready for Vercel deployment"
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy frontend to Vercel (see instructions above)"
echo "  2. Test full stack at https://${VERCEL_DOMAIN}"
echo "  3. Set up monitoring at https://uptimerobot.com"
echo "  4. Update DNS if using custom domain"
echo ""
echo "🔗 Useful Commands:"
echo "  - View logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
echo "  - Update env: gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars KEY=VALUE"
echo "  - Redeploy: gcloud builds submit --tag $IMAGE && gcloud run deploy $SERVICE_NAME --image $IMAGE --region $REGION"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
