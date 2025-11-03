# iOS App Store Build & Submission Guide

## Prerequisites ✅
- [x] Apple Developer Account (nabeelmumtaz92@gmail.com)
- [x] EAS configuration ready
- [x] Production API endpoint (https://returnit.online)
- [x] Stripe live keys configured

---

## STEP 1: Build iOS Apps with EAS

### On your Windows machine (`C:\Users\nsm21\Desktop\ReturnIt\`):

```bash
# Make sure you're logged into EAS
eas login
# Use: nabeelmumtaz92@gmail.com

# Build Customer App for iOS
cd mobile-apps/returnit-customer
eas build --platform ios --profile production

# Build Driver App for iOS
cd ../returnit-driver
eas build --platform ios --profile production
```

### What happens during build:
- ✅ EAS handles all code signing automatically
- ✅ Build number auto-increments
- ✅ Creates production .ipa files
- ⏱️ Takes ~15-20 minutes per app
- 📦 Downloadable from EAS dashboard

### Expected output:
```
✔ Build successful!
Build ID: [unique-build-id]
Build URL: https://expo.dev/accounts/nabeelmumtaz92/...
```

---

## STEP 2: Submit to App Store Connect

After builds complete, submit them:

```bash
# Submit Customer App
cd mobile-apps/returnit-customer
eas submit --platform ios

# Submit Driver App
cd ../returnit-driver
eas submit --platform ios
```

### What happens:
- ✅ EAS automatically uploads .ipa to App Store Connect
- ✅ Uses your Apple ID (nabeelmumtaz92@gmail.com)
- ⏱️ Processing takes 10-30 minutes
- 📧 You'll receive email when processing completes

---

## STEP 3: Configure in App Store Connect

Go to: https://appstoreconnect.apple.com

### For CUSTOMER APP ("Return It - Package Returns"):

#### **1. Create App Record**
- Click **My Apps** → **+** → **New App**
- Platform: **iOS**
- App Name: **"Return It"** or **"Return It - Package Returns"**
- Primary Language: **English (U.S.)**
- Bundle ID: **com.returnit.customer** (select from dropdown)
- SKU: **returnit-customer-001**

#### **2. App Information**
- Category: **Business** (primary), **Utilities** (secondary)
- Privacy Policy URL: `https://returnit.online/privacy` *(create this page)*
- Support URL: `https://returnit.online/support` *(create this page)*

#### **3. App Privacy**
Declare data collection:
- ✅ **Name, Email, Phone Number** (Account creation)
- ✅ **Physical Address** (Pickup location)
- ✅ **Photos** (Package verification)
- ✅ **Payment Information** (Processed by Stripe)
- ✅ **Order History** (Tracking purposes)

#### **4. Pricing & Availability**
- Price: **Free** (customer pays per booking)
- Availability: **United States** (St. Louis focus initially)

#### **5. Prepare for Submission**
- Upload app icon (1024x1024px - cardboard theme)
- Upload screenshots (iPhone 16):
  - **Required sizes**: 6.7", 6.5", 5.5"
  - **Minimum**: 3 screenshots per size
  - **Show**: Booking flow, tracking, payment, order history
- App description (see template below)
- Keywords: `return, package, delivery, shipping, courier, logistics`
- Select build (uploaded via EAS)

#### **6. Version Information**
- Version: **1.0.0**
- Copyright: **© 2025 Return It**
- What's New: `Initial release - Professional package return service with real-time tracking`

---

### For DRIVER APP ("Return It Driver"):

#### **1. Create App Record**
- App Name: **"Return It Driver"**
- Bundle ID: **com.returnit.driver**
- SKU: **returnit-driver-001**

#### **2. App Information**
- Category: **Business** (primary), **Navigation** (secondary)
- Privacy Policy URL: `https://returnit.online/privacy`
- Support URL: `https://returnit.online/support`

#### **3. App Privacy**
Declare data collection:
- ✅ **Name, Email, Phone Number** (Account creation)
- ✅ **Precise Location** (Background tracking for deliveries)
- ✅ **Photos** (Package verification, proof of delivery)
- ✅ **Payment Information** (Earnings, payouts via Stripe)
- ✅ **Bank Account Info** (Instant pay feature)

**Note**: Background location requires justification - explain it's for real-time driver tracking and route optimization.

#### **4. Prepare for Submission**
- Upload driver app icon (1024x1024px)
- Upload screenshots showing:
  - Available jobs list
  - Job details & navigation
  - Package photo capture
  - Earnings dashboard
  - Instant payout feature
- Keywords: `driver, delivery, courier, gig, earnings, jobs`

---

## STEP 4: App Review Information

### **Demo Account** (REQUIRED - create these):

**Customer Demo:**
```
Email: demo-customer@returnit.com
Password: Demo2025!
```
Pre-populate with:
- 2-3 completed orders (with tracking history)
- 1 active order (in transit)
- Sample payment methods

**Driver Demo:**
```
Email: demo-driver@returnit.com
Password: Demo2025!
```
Pre-populate with:
- 5-10 available jobs
- 2-3 active pickups
- Earnings history ($200-500)
- Verified Stripe account (test mode)

### **Notes for Reviewers:**

```
Return It is a reverse logistics platform connecting customers with drivers.

CUSTOMER APP:
1. Login with demo account provided above
2. Click "Book a Return" to see booking flow
3. Select store location (Google Places integration)
4. Add items with photos
5. Complete test payment (Stripe test mode)
6. View order in "My Orders" with tracking

DRIVER APP:
1. Login with demo account provided above
2. View "Available Jobs" tab
3. Accept a job to see navigation
4. Camera is used for package verification
5. View earnings in "Earnings" tab
6. Test instant payout feature

Both apps connect to production API: https://returnit.online
Stripe is in test mode for review. All payments are test transactions.
```

---

## STEP 5: Compliance Questions

### **Export Compliance:**
- ❓ Does your app use encryption?
  - ✅ **Yes** (HTTPS encryption)
- ❓ Is your app exempt from export compliance?
  - ✅ **Yes** - Standard HTTPS exemption (no custom encryption)

### **Content Rights:**
- ✅ You own all rights to app content

### **Advertising Identifier (IDFA):**
- ❌ **No** - Not using for advertising or tracking

---

## STEP 6: Submit for Review

1. Review all information for accuracy
2. Click **Add for Review**
3. Click **Submit to App Review**

**Timeline:**
- ⏱️ **First submission**: 3-7 days
- ⏱️ **Updates**: 24-48 hours after approval

---

## App Description Templates

### Customer App Description:
```
Return It - Professional Package Return Service

Turn returns into a simple tap. Return It handles your package returns, exchanges, and donations with professional pickup and delivery service.

KEY FEATURES:
• Real-time driver tracking with GPS
• Multiple pricing tiers (Standard, Priority, Instant)
• Secure payment processing with Stripe
• Photo verification for peace of mind
• Order history and tracking
• 600+ verified St. Louis retail locations
• Same-day and scheduled pickups

HOW IT WORKS:
1. Select your store location
2. Add items with photos
3. Choose pickup time and pricing tier
4. Track your driver in real-time
5. Get confirmation when delivered

PRICING:
• Standard: $6.99 (next available driver)
• Priority: $9.99 (faster pickup)
• Instant: $12.99 (immediate pickup)

WHY RETURN IT?
✓ Save time - no trips to the store
✓ Professional service - verified drivers
✓ Full transparency - track every step
✓ Secure payments - Stripe protected
✓ Peace of mind - photo verification

Perfect for busy professionals, families, and anyone who values their time.

Download Return It today and simplify your returns!
```

### Driver App Description:
```
Return It Driver - Flexible Delivery Earnings

Join the Return It driver network and earn on your schedule with our professional reverse logistics platform.

DRIVER BENEFITS:
• Instant Pay - cash out anytime with $0.50 fee
• Flexible schedule - work when you want
• Competitive earnings - keep 70% of each delivery
• Route optimization - AI-powered batching
• Real-time job notifications
• Weekly payouts via Stripe

FEATURES:
• GPS navigation with Google Maps
• Package photo verification
• Digital signature capture
• Earnings dashboard (daily/weekly/monthly)
• Multi-stop route optimization
• Background location tracking for jobs

EARNINGS:
• Standard jobs: $5 per delivery
• Priority jobs: $8 per delivery
• Instant jobs: $10 per delivery
• Plus tips from customers!

HOW IT WORKS:
1. Accept available jobs nearby
2. Navigate to pickup location
3. Verify package with photo
4. Deliver to retail location
5. Get paid instantly or weekly

REQUIREMENTS:
• Valid driver's license
• Reliable vehicle
• Smartphone with GPS
• Background check (Stripe Identity)

Join thousands of drivers earning with Return It. Download now and start driving!
```

---

## Pre-Launch Checklist

### Before Submitting:
- [ ] Create demo customer account with sample orders
- [ ] Create demo driver account with available jobs
- [ ] Create privacy policy page at returnit.online/privacy
- [ ] Create support page at returnit.online/support
- [ ] Take screenshots on iPhone 16 (3-5 per app)
- [ ] Export app icons at 1024x1024px
- [ ] Test booking flow end-to-end
- [ ] Test driver job flow end-to-end
- [ ] Verify all API endpoints work with production URL
- [ ] Ensure Stripe is in test mode for demo accounts

### After Builds Complete:
- [ ] Download .ipa files from EAS (optional backup)
- [ ] Submit both apps via `eas submit`
- [ ] Wait for processing (check email)
- [ ] Configure App Store Connect for both apps
- [ ] Fill in all required metadata
- [ ] Upload screenshots and icons
- [ ] Submit for review

### During Review:
- [ ] Monitor Resolution Center in App Store Connect
- [ ] Respond to any reviewer questions within 24 hours
- [ ] Test that demo accounts still work

---

## Common Issues & Solutions

### Build fails with code signing error:
```bash
# Re-authenticate with Apple
eas login
# Rebuild with --clear-cache
eas build --platform ios --profile production --clear-cache
```

### Upload to App Store Connect fails:
```bash
# Submit manually with build ID
eas submit --platform ios --id [build-id]
```

### Demo account doesn't work:
- Ensure accounts are created in production database
- Verify Stripe is in test mode for demo accounts
- Check API is accessible from mobile apps

### Screenshots required for multiple sizes:
- Use iPhone 16 for primary screenshots (6.7")
- Take same screenshots and resize for 6.5" and 5.5"
- Tools: Figma, Sketch, or Apple's screenshot tools

---

## Next Steps After Approval

1. **Soft Launch**: Release to small group first
2. **Monitor**: Check crash reports and reviews
3. **Iterate**: Fix bugs and gather feedback
4. **Scale**: Expand to more cities
5. **OTA Updates**: Use `eas update` for instant fixes

---

## Useful Commands

```bash
# Check build status
eas build:list

# View specific build
eas build:view [build-id]

# Check submission status
eas submit:list

# Re-submit if needed
eas submit --platform ios --id [build-id]

# Update apps without rebuild (OTA)
cd mobile-apps/returnit-customer && eas update
cd mobile-apps/returnit-driver && eas update
```

---

## Support

- **EAS Dashboard**: https://expo.dev/accounts/nabeelmumtaz92
- **App Store Connect**: https://appstoreconnect.apple.com
- **Expo Documentation**: https://docs.expo.dev
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/

---

**Ready to build?** Start with STEP 1 above! 🚀
