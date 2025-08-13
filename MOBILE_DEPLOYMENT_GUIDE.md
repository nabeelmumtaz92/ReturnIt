# Returnly Driver App - Google Play Store Deployment Guide

## Prerequisites

### 1. Google Play Console Setup
- Go to [Google Play Console](https://play.google.com/console)
- Pay the $25 one-time developer registration fee
- Complete account verification (1-3 business days)
- Set up merchant account for paid apps/in-app purchases

### 2. Development Environment Setup
```bash
# Install required tools
npm install -g @expo/cli
npm install -g eas-cli

# Login to Expo
npx expo login

# Navigate to mobile app directory
cd mobile-driver-app
```

## Build Configuration

### 1. Update App Configuration
Edit `app.json` with production settings:

```json
{
  "expo": {
    "name": "Returnly Driver",
    "slug": "returnly-driver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.returnly.driver"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.returnly.driver",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. EAS Build Configuration
Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Build Process

### 1. Create Production Build
```bash
# Initialize EAS project
eas init

# Configure project
eas build:configure

# Build for Android production
eas build --platform android --profile production
```

### 2. Generate App Bundle
The build process will create an Android App Bundle (.aab file) optimized for Google Play Store.

## Google Play Console Setup

### 1. Create New App
1. Go to Google Play Console
2. Click "Create app"
3. Fill in app details:
   - **App name**: Returnly Driver
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - **User program policies**: Accept all

### 2. App Content Requirements

#### Store Listing
- **App name**: Returnly Driver
- **Short description**: Professional delivery management for drivers
- **Full description**: 
```
Returnly Driver is the essential mobile app for professional delivery drivers working with the Returnly return logistics platform. 

Key Features:
• Real-time job notifications and management
• GPS navigation and route optimization
• Package verification with camera integration
• Earnings tracking and instant payout options
• Customer communication tools
• Performance analytics and driver ratings

Designed for efficiency and ease of use, Returnly Driver helps delivery professionals maximize their earnings while providing excellent customer service.

Join the future of return logistics with Returnly Driver.
```

#### Graphics Requirements
- **App icon**: 512x512px PNG
- **Feature graphic**: 1024x500px JPG/PNG
- **Screenshots**: At least 2, up to 8 phone screenshots
- **Phone screenshots**: 16:9 or 9:16 aspect ratio

#### App Category
- **Category**: Business
- **Tags**: delivery, logistics, driver, business

### 3. Content Rating
Complete the content rating questionnaire:
- Target age group: 18+
- Contains ads: No
- In-app purchases: No
- User-generated content: No

### 4. Privacy Policy
Required for apps handling user data. Include:
- Location data usage
- Camera permissions
- User account information
- Data retention policies

## Upload and Release

### 1. Upload App Bundle
1. Go to "Production" in Play Console
2. Click "Create new release"
3. Upload the .aab file from EAS build
4. Fill in release notes
5. Save and review

### 2. Release Rollout
- **Testing**: Internal testing first
- **Production**: 100% rollout after testing
- **Timeline**: 2-3 hours for review, immediate publication

## Post-Launch

### 1. Monitor Performance
- App vitals and crash reports
- User reviews and ratings
- Download and engagement metrics

### 2. Updates
- Use `eas build` for new versions
- Increment version code in app.json
- Upload through Play Console

## Cost Summary
- **Google Play Console**: $25 (one-time)
- **Total deployment cost**: $25
- **Timeline**: 1-2 days after account approval

## Support
- Google Play Console Help Center
- Expo EAS Build documentation
- Returnly development team support

---
*Last updated: January 2025*