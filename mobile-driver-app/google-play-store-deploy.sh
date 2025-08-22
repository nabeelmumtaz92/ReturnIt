#!/bin/bash

# ReturnIt Android App - Google Play Store Deployment Script
# This script builds and deploys the ReturnIt app to Google Play Store

echo "🚀 Starting ReturnIt Android App deployment to Google Play Store..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Login to Expo (if not already logged in)
echo "🔐 Logging into Expo..."
eas login

# Build the Android app for production
echo "🏗️ Building Android app for production..."
eas build --platform android --profile production

echo "✅ Android build completed!"
echo "📱 The APK/AAB file is now ready for Google Play Store upload."

# Optional: Submit directly to Google Play Store (requires service account key)
read -p "Do you want to submit directly to Google Play Store? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Submitting to Google Play Store..."
    eas submit --platform android --profile production
    echo "🎉 App submitted to Google Play Store successfully!"
else
    echo "📋 Manual upload required:"
    echo "1. Download the built APK/AAB from Expo dashboard"
    echo "2. Go to Google Play Console: https://play.google.com/console"
    echo "3. Upload the APK/AAB file to your app listing"
    echo "4. Complete the store listing and publish"
fi

echo "🎯 Deployment process completed!"