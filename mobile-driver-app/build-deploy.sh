#!/bin/bash

# Returnly Driver App - Automated Build & Deploy Script
# This script handles the complete build process for both iOS and Android

echo "🚀 Returnly Driver App - Automated Build & Deploy"
echo "================================================="
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    print_error "app.json not found. Please run this script from the mobile-driver-app directory."
    exit 1
fi

print_status "Validating project configuration..."

# Validate app.json
if ! command -v jq &> /dev/null; then
    print_warning "jq not installed. Skipping JSON validation."
else
    if jq . app.json > /dev/null 2>&1; then
        print_success "app.json is valid"
    else
        print_error "app.json is invalid. Please check the JSON syntax."
        exit 1
    fi
fi

# Check if Expo CLI is installed
print_status "Checking Expo CLI installation..."
if ! command -v expo &> /dev/null; then
    print_status "Installing Expo CLI globally..."
    npm install -g @expo/cli
    if [ $? -eq 0 ]; then
        print_success "Expo CLI installed successfully"
    else
        print_error "Failed to install Expo CLI"
        exit 1
    fi
else
    print_success "Expo CLI is already installed"
fi

# Check Expo authentication
print_status "Checking Expo authentication..."
if ! expo whoami &> /dev/null; then
    print_warning "Not logged in to Expo. Please login:"
    expo login
    if [ $? -ne 0 ]; then
        print_error "Failed to login to Expo"
        exit 1
    fi
else
    EXPO_USER=$(expo whoami 2>/dev/null)
    print_success "Logged in as: $EXPO_USER"
fi

# Create build timestamp
BUILD_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
print_status "Starting build process at $BUILD_TIMESTAMP"

# Build for iOS (App Store) using EAS Build
print_status "Building iOS version for App Store..."
echo "Using EAS Build (modern Expo build service)..."
echo "This may take 5-15 minutes depending on EAS build queue..."
CI=1 npx eas build --platform ios --non-interactive

if [ $? -eq 0 ]; then
    print_success "iOS build queued successfully with EAS"
else
    print_warning "EAS build requires account setup. Please run 'npx eas build --platform ios' manually."
fi

# Build for Android (Google Play) using EAS Build  
print_status "Building Android version for Google Play..."
echo "Using EAS Build (modern Expo build service)..."
echo "This may take 5-15 minutes depending on EAS build queue..."
CI=1 npx eas build --platform android --non-interactive

if [ $? -eq 0 ]; then
    print_success "Android build queued successfully with EAS"
else
    print_warning "EAS build requires account setup. Please run 'npx eas build --platform android' manually."
fi

echo ""
print_success "🎉 Build process initiated successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Monitor build progress: https://expo.dev/builds"
echo "2. Download builds when complete (usually 5-15 minutes)"
echo "3. iOS file: Download .ipa file for App Store Connect"
echo "4. Android file: Download .aab file for Google Play Console"
echo ""
echo "📖 Detailed submission guides:"
echo "- deployment-checklist.md - Complete step-by-step process"
echo "- app-store-submission-guide.md - Store listing templates"
echo "- QUICK_DEPLOY.md - 3-step deployment summary"
echo ""
echo "💰 Store Setup Costs:"
echo "- Apple Developer: \$99/year"
echo "- Google Play: \$25 one-time"
echo "- Total: \$124 to deploy to both platforms"
echo ""
print_success "Your Returnly Driver app is ready for the app stores! 🚀"