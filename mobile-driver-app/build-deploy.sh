#!/bin/bash

# Returnly Driver App - Build & Deploy Script
# This script handles the complete build process for both iOS and Android

echo "🚀 Returnly Driver App - Build & Deploy Script"
echo "============================================="

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Check if user is logged in to Expo
echo "🔑 Checking Expo authentication..."
if ! expo whoami &> /dev/null; then
    echo "Please login to Expo:"
    expo login
fi

echo "📱 Building Returnly Driver App..."

# Build for iOS (App Store)
echo "🍎 Building iOS version for App Store..."
expo build:ios --type archive --non-interactive

# Build for Android (Google Play)
echo "🤖 Building Android version for Google Play..."
expo build:android --type app-bundle --non-interactive

echo "✅ Build process completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Download your build files from the Expo build dashboard"
echo "2. Upload iOS build to App Store Connect"
echo "3. Upload Android build to Google Play Console"
echo "4. Complete app store listings using the deployment-checklist.md guide"
echo ""
echo "🔗 Build Dashboard: https://expo.dev/builds"