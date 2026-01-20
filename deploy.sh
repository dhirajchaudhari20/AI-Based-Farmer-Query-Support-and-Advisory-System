#!/bin/bash

# Configuration
PROJECT_ID="agriintel-final"
APP_NAME="agriintel-frontend"
REGION="us-central1"
GCLOUD_CMD="/Users/dhirajchaudhari/Downloads/google-cloud-sdk/bin/gcloud"

# Ensure we stop on error
set -e

echo "🚀 Deploying $APP_NAME to Google Cloud Run..."

# Load environment variables from .env.local if present
if [ -f .env.local ]; then
    echo "📄 Loading environment variables from .env.local..."
    export $(grep -v '^#' .env.local | xargs)
fi

# Check if GEMINI_API_KEY is set in environment, otherwise ask for it
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY is not set."
    echo "Please ensure .env.local exists with GEMINI_API_KEY or export it manually."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
$GCLOUD_CMD builds submit --tag gcr.io/$PROJECT_ID/$APP_NAME --project $PROJECT_ID

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
$GCLOUD_CMD run deploy $APP_NAME \
  --image gcr.io/$PROJECT_ID/$APP_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY

echo "✅ Deployment complete!"
