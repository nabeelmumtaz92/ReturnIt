# Native Apps Deployment Guide - Google Play & App Store

## 📱 Apps to Deploy

### 1. Customer App
- **Package (Android):** `com.returnit.customer`
- **Bundle ID (iOS):** `com.returnit.customer`
- **EAS Project ID:** `afe3f0da-5c84-4d7b-80bd-51bfff61ef6a`
- **App Name:** ReturnIt

### 2. Driver App
- **Package (Android):** `com.returnit.driver`
- **Bundle ID (iOS):** `com.returnit.driver`
- **EAS Project ID:** `6dc97462-a28e-4563-adeb-5de73d87e0ce`
- **App Name:** ReturnIt Driver

---

## ✅ Pre-Deployment Checklist

### Required Accounts
- [x] Expo account (owner: nabeelmumtaz92)
- [ ] Google Play Console developer account ($25 one-time fee)
- [ ] Apple Developer account ($99/year)

### Required Credentials
**For Android:**
- [ ] Google Play signing key (EAS will manage this)

**For iOS:**
- [ ] Apple Developer account access
- [ ] App Store Connect access
- [ ] iOS certificates (EAS will manage this)

---

## 🚀 Step-by-Step Deployment Process

### Phase 1: Build Production Apps

#### Step 1: Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
eas login
```
Login with: nabeelmumtaz92@gmail.com

#### Step 2: Build Customer App

**For Android (Google Play):**
```bash
cd mobile-apps/returnit-customer
eas build --profile production --platform android
```

**For iOS (App Store):**
```bash
cd mobile-apps/returnit-customer
eas build --profile production --platform ios
```

#### Step 3: Build Driver App

**For Android (Google Play):**
```bash
cd mobile-apps/returnit-driver
eas build --profile production --platform android
```

**For iOS (App Store):**
```bash
cd mobile-apps/returnit-driver
eas build --profile production --platform ios
```

---

### Phase 2: Submit to Google Play Store

#### Customer App Submission
```bash
cd mobile-apps/returnit-customer
eas submit --profile production --platform android
```

**Follow the prompts:**
1. Select the build you just created
2. Enter your Google Service Account JSON key (or follow setup instructions)
3. Submission will be created as DRAFT in Play Console

#### Driver App Submission
```bash
cd mobile-apps/returnit-driver
eas submit --profile production --platform android
```

#### Configure in Google Play Console

**For Both Apps:**
1. Go to Google Play Console
2. Complete store listing:
   - **App name**
   - **Short description** (80 chars)
   - **Full description**
   - **App icon** (512x512)
   - **Feature graphic** (1024x500)
   - **Screenshots** (at least 2 phone screenshots)
   
3. Fill out content rating questionnaire
4. Set up pricing & distribution (Free)
5. Complete privacy policy URL
6. Submit for review

**Store Listing Examples:**

**Customer App:**
- **Name:** ReturnIt - Easy Returns & Exchanges
- **Short:** Return packages effortlessly - we pick up and deliver to the store for you!
- **Category:** Business
- **Keywords:** returns, exchanges, delivery, pickup, package return service

**Driver App:**
- **Name:** ReturnIt Driver - Earn With Deliveries
- **Short:** Earn money delivering returns and packages with flexible hours and great pay!
- **Category:** Business
- **Keywords:** delivery driver, gig economy, flexible work, driver jobs, earn money

---

### Phase 3: Submit to Apple App Store

#### Customer App Submission
```bash
cd mobile-apps/returnit-customer
eas submit --profile production --platform ios
```

#### Driver App Submission
```bash
cd mobile-apps/returnit-driver
eas submit --profile production --platform ios
```

#### Configure in App Store Connect

**For Both Apps:**
1. Go to App Store Connect
2. Create new apps (if not exists)
3. Complete app information:
   - **Name**
   - **Subtitle** (30 chars)
   - **Description**
   - **Keywords** (100 chars)
   - **Screenshots** (iPhone 6.7", 6.5", 5.5")
   - **App icon** (1024x1024)
   
4. Fill out age rating
5. Set pricing to Free
6. Privacy policy URL
7. App review information
8. Submit for review

---

## 📋 Required Store Assets

### Screenshots Needed

**Customer App:**
- Welcome/login screen
- Booking pickup screen
- Order tracking screen
- Payment screen
- Order history screen

**Driver App:**
- Login screen
- Job list screen
- Active delivery screen
- GPS navigation screen
- Earnings dashboard

### App Icons
- **512x512** for Google Play
- **1024x1024** for App Store
- Both apps need unique icons (customer vs driver branding)

### Marketing Assets
- **Feature Graphic** (1024x500) for Google Play
- **Promo Video** (optional but recommended)

---

## 🧪 Testing Before Submission

### Internal Testing (Recommended)

**Android - Internal Testing Track:**
```bash
cd mobile-apps/returnit-customer
eas submit --profile preview --platform android
```

**iOS - TestFlight:**
```bash
cd mobile-apps/returnit-customer
eas submit --profile preview --platform ios
```

**Test Checklist:**
- [ ] App launches successfully
- [ ] Login/registration works
- [ ] Core features function correctly
- [ ] Location permissions work
- [ ] Camera permissions work
- [ ] Payment flow works (test mode)
- [ ] Navigation between screens is smooth
- [ ] No crashes or major bugs

---

## 🔐 Privacy & Permissions

### Privacy Policy Requirements

Both apps MUST have a privacy policy covering:
- Location data collection and usage
- Camera access and photo storage
- Personal information handling
- Payment data processing
- Third-party services (Stripe, Mapbox, etc.)
- Data retention and deletion

**Create privacy policy at:** https://returnit.online/privacy

### Permission Justifications

**Customer App:**
- **Location:** "To schedule pickups at your current location and track deliveries in real-time"
- **Camera:** "To take photos of packages for verification and support requests"

**Driver App:**
- **Location:** "To receive job assignments, navigate to pickup/delivery locations, and track your routes"
- **Background Location:** "To update your location while making deliveries, even when the app is minimized"
- **Camera:** "To verify packages and capture proof of delivery photos"

---

## ⚠️ Common Rejection Reasons & How to Avoid

### Google Play
1. **Privacy Policy Missing** → Add URL in app.json and Play Console
2. **Permissions Not Justified** → Clear descriptions in app.json
3. **Broken Functionality** → Test thoroughly before submitting
4. **Inappropriate Content** → Keep app professional

### Apple App Store
1. **Incomplete Information** → Fill ALL required fields in App Store Connect
2. **Missing Test Account** → Provide working test login if needed
3. **Privacy Policy Issues** → Ensure privacy policy is accessible and comprehensive
4. **Performance Issues** → Test on actual devices

---

## 📊 Post-Launch Monitoring

### Key Metrics to Track
- Download/install rates
- User retention (Day 1, Day 7, Day 30)
- Crash-free rate (aim for >99%)
- App store ratings and reviews
- Feature usage analytics

### Tools
- **Expo Analytics** - Built-in analytics
- **Firebase Analytics** - Detailed user behavior
- **Google Play Console** - Android-specific metrics
- **App Store Connect** - iOS-specific metrics

---

## 🔄 Update Process

### For Bug Fixes or Minor Updates:
1. Increment version in app.json:
   ```json
   "version": "1.0.1"  // or 1.1.0 for features
   ```
2. Build new version: `eas build --profile production --platform [android|ios]`
3. Submit: `eas submit --profile production --platform [android|ios]`
4. Review typically faster for updates (1-3 days)

### For OTA (Over-The-Air) Updates:
For JS-only changes (no native code):
```bash
eas update --branch production --message "Bug fixes"
```
Updates instantly without app store review!

---

## 💰 Cost Summary

### One-Time Costs
- **Google Play Developer Account:** $25 (one-time)
- **Apple Developer Account:** $99/year

### Build Costs (Expo EAS)
- **Free tier:** Limited builds per month
- **Production plan:** $29/month (unlimited builds)

### Monthly Running Costs
- Expo EAS: ~$29/month (if needed)
- Server hosting: (already covered)
- Push notifications: Free tier usually sufficient

---

## 🆘 Support & Troubleshooting

### Build Issues
- Check `eas build` logs in Expo dashboard
- Ensure all dependencies are compatible
- Verify credentials are correct

### Submission Issues
- Check app store rejection emails carefully
- Address all feedback before resubmitting
- Use TestFlight/Internal Testing first

### Contact Support
- **Expo Support:** https://expo.dev/support
- **Google Play Support:** Via Play Console
- **Apple Developer Support:** Via App Store Connect

---

## 🎯 Launch Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Build apps | 20-40 min | Per platform (4 builds total) |
| Create store listings | 2-4 hours | Screenshots, descriptions, etc. |
| Submit to stores | 30 min | Automated via EAS |
| Google Play review | 1-7 days | Usually 1-3 days |
| Apple review | 1-3 days | Usually 24-48 hours |
| **Total time to live** | **3-10 days** | From start to public |

---

## ✅ Quick Start Commands

**Build all apps for production:**
```bash
# Customer - Android
cd mobile-apps/returnit-customer && eas build --profile production --platform android

# Customer - iOS
cd mobile-apps/returnit-customer && eas build --profile production --platform ios

# Driver - Android
cd mobile-apps/returnit-driver && eas build --profile production --platform android

# Driver - iOS
cd mobile-apps/returnit-driver && eas build --profile production --platform ios
```

**Submit all apps:**
```bash
# Customer apps
cd mobile-apps/returnit-customer
eas submit --profile production --platform android
eas submit --profile production --platform ios

# Driver apps
cd mobile-apps/returnit-driver
eas submit --profile production --platform android
eas submit --profile production --platform ios
```

---

**Ready to start?** 

1. Ensure you have Google Play Console and Apple Developer accounts
2. Run the build commands above
3. Follow the submission process
4. Monitor the app stores for approval!

🚀 Good luck with your app launches!
