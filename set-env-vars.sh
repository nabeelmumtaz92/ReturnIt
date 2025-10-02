#!/bin/bash
# Set Environment Variables for Cloud Run
# Usage: ./set-env-vars.sh

set -e

SERVICE_NAME="returnit-backend"
REGION="us-central1"

echo "🔐 Setting environment variables for $SERVICE_NAME..."

# IMPORTANT: Replace these with your actual values
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
CORS_ORIGIN="https://your-frontend-on-vercel.vercel.app,https://returnit.online"

gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" \
  --set-env-vars "CORS_ORIGIN=${CORS_ORIGIN}" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "SESSION_SECRET=$(openssl rand -base64 32)" \
  --set-env-vars "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" \
  --set-env-vars "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" \
  --set-env-vars "OPENAI_API_KEY=${OPENAI_API_KEY}"

echo "✅ Environment variables set successfully!"
echo "⚠️  Make sure to update the values in this script before running!"
