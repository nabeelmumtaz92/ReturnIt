#!/bin/bash
# ReturnIt Cloud Run Deployment Script
# Usage: ./deploy-cloud-run.sh

set -e

# Configuration
PROJECT_ID="YOUR_GCP_PROJECT_ID"  # Replace with your GCP project ID
SERVICE_NAME="returnit-backend"
REGION="us-central1"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying ReturnIt Backend to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Authenticate
echo "📝 Authenticating with Google Cloud..."
gcloud auth login

# Set project
echo "📦 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Enable required services
echo "⚙️  Enabling required GCP services..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Build container image
echo "🔨 Building container image..."
gcloud builds submit --tag $IMAGE

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables with: ./set-env-vars.sh"
echo "2. Get service URL with: gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'"
echo "3. Test with: curl https://YOUR_CLOUD_RUN_URL/api/health"
