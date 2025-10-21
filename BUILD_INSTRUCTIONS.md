# 🚀 Build .AAB Files - Step by Step Guide

## ✅ Setup Complete!

Both mobile apps are configured and ready to build. Your EAS CLI is already installed.

---

## 📱 Which App to Build?

### 1. **Driver App** (mobile-driver-app/)
- For delivery drivers
- Package: `com.returnit.app`

### 2. **Customer App** (mobile-apps/returnit-customer/)
- For customers booking returns
- Package: `com.returnit.customer`

---

## 🔐 Step 1: Login to Expo (YOU DO THIS)

Open the terminal and run:

```bash
eas login
```

**Enter your Expo credentials when prompted:**
- Email: [your Expo account email]
- Password: [your password - will be hidden]

This creates a secure session. **Takes 30 seconds.**

---

## 📦 Step 2: Build Driver App .AAB

After you login, I'll run these commands:

```bash
cd mobile-driver-app
eas build --platform android --profile production
```

This will:
- ✅ Build Android App Bundle (.aab)
- ✅ Upload to Expo's servers
- ✅ Provide download link
- ⏱️ Takes 10-15 minutes

---

## 📦 Alternative: Build Customer App .AAB

If you want the customer app instead:

```bash
cd mobile-apps/returnit-customer
eas build --platform android --profile production
```

---

## 🎯 What You'll Get

After build completes:
- ✅ Download link to .aab file
- ✅ Ready for Google Play Console upload
- ✅ Signed and production-ready

---

## 🚦 Current Status

- [x] EAS CLI installed
- [x] Both apps configured
- [x] Build profiles set to create .aab
- [ ] **YOU NEED TO: Run `eas login`**
- [ ] Then I'll start the build

---

## ⚡ Quick Start

**Run this command now:**
```bash
eas login
```

Once you're logged in, tell me:
1. "Build driver app" or
2. "Build customer app" or
3. "Build both apps"

Then I'll handle the rest!
