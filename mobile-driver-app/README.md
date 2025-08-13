# Returnly Driver Mobile App

Native React Native mobile app for Returnly drivers, providing seamless delivery management on-the-go.

## Features

✅ **Complete Job Management**
- Accept/reject pickup requests
- Real-time job status tracking
- GPS navigation integration

✅ **Native Mobile Features**
- Camera integration for package photos
- Push notifications for new jobs
- Location services for driver tracking
- Background app operation

✅ **Earnings Dashboard**
- Live earnings tracking
- Daily/weekly performance stats
- Driver rating system

✅ **Professional Integration**
- Connects to Returnly backend API
- Stripe Connect payment processing
- Real-time customer communication

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## App Store Deployment

### Prerequisites
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)

### Deployment Steps

1. **Build for Production**
   ```bash
   expo build:ios
   expo build:android
   ```

2. **Submit to App Stores**
   - iOS: Upload to App Store Connect
   - Android: Upload to Google Play Console

### App Store Information

**App Name**: Returnly Driver
**Category**: Business
**Keywords**: delivery, driver, logistics, returns
**Description**: Professional delivery driver app for Returnly's return logistics platform

## Technical Architecture

- **Framework**: React Native with Expo
- **Maps**: React Native Maps
- **Camera**: Expo Camera
- **Notifications**: Expo Notifications
- **Location**: Expo Location
- **Backend**: Node.js Express API
- **Payment**: Stripe Connect

## Production Configuration

The app connects to your Returnly backend at returnly.tech for:
- Driver authentication
- Job management
- Payment processing
- Customer data

## Support

For driver support and technical issues, contact through the in-app support chat system.