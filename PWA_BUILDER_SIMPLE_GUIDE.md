# 🚀 Build Customer & Driver Apps - Simple Method

You don't need to host manifest files! PWABuilder can create apps directly from your site URLs with manual configuration.

---

## 📱 **Method 1: Direct URL Method (Recommended)**

### **Customer App:**

1. Go to https://pwabuilder.com
2. Enter: `https://returnit.online/customer-mobile-app`
3. Click **"Start"**
4. Click **"Package for Stores"** → **"Android"**
5. Fill in:
   - **App Name**: Return It - Easy Returns
   - **Package ID**: com.returnit.customer
   - **App Version**: 1.0.0
   - **Start URL**: /customer-mobile-app
   - **Display Mode**: standalone
   - **Theme Color**: #D97706
   - **Background Color**: #FEF3E2
6. Click **"Generate Package"**
7. Download: `returnit-customer.aab`

### **Driver App:**

1. Go to https://pwabuilder.com
2. Enter: `https://returnit.online/mobile-driver`
3. Click **"Start"**
4. Click **"Package for Stores"** → **"Android"**
5. Fill in:
   - **App Name**: Return It Driver - Earn Money
   - **Package ID**: com.returnit.driver
   - **App Version**: 1.0.0
   - **Start URL**: /mobile-driver
   - **Display Mode**: standalone
   - **Theme Color**: #10B981
   - **Background Color**: #1F2937
6. Click **"Generate Package"**
7. Download: `returnit-driver.aab`

---

## 📦 **Method 2: Use GitHub Gist (Alternative)**

If PWABuilder requires manifest URLs, host them on GitHub Gist:

### **Step 1: Create Gists**

1. Go to https://gist.github.com
2. Create new gist named `manifest-customer.json`
3. Paste this content:

```json
{
  "id": "com.returnit.customer",
  "name": "Return It - Easy Returns",
  "short_name": "Return It",
  "description": "Schedule hassle-free return pickups",
  "start_url": "https://returnit.online/customer-mobile-app",
  "display": "standalone",
  "theme_color": "#D97706",
  "background_color": "#FEF3E2",
  "icons": [
    {
      "src": "https://returnit.online/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://returnit.online/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

4. Click **"Create public gist"**
5. Click **"Raw"** button → Copy the URL (e.g., `https://gist.githubusercontent.com/...`)

6. Repeat for driver app with this content:

```json
{
  "id": "com.returnit.driver",
  "name": "Return It Driver - Earn Money",
  "short_name": "Return It Driver",
  "description": "Deliver returns and earn money",
  "start_url": "https://returnit.online/mobile-driver",
  "display": "standalone",
  "theme_color": "#10B981",
  "background_color": "#1F2937",
  "icons": [
    {
      "src": "https://returnit.online/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://returnit.online/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Step 2: Use Gist URLs in PWABuilder**

1. Go to https://pwabuilder.com
2. Enter your Gist raw URL (from step 5 above)
3. Follow the same steps as Method 1

---

## 🎯 **Quickest Path to .aab Files:**

**Just use Method 1!** PWABuilder will:
- Scan your pages automatically
- Generate proper manifests
- Build .aab files instantly

No hosting needed - PWABuilder handles everything!

---

## 📤 **After You Have Both .aab Files:**

1. Go to https://play.google.com/console
2. Create **2 separate apps**:
   - Return It - Easy Returns (customer app)
   - Return It Driver (driver app)
3. Upload the corresponding .aab files
4. Follow the rest of the guide in `DUAL_APP_DEPLOYMENT_GUIDE.md`

---

## ✅ **Summary:**

You have **3 working options**:

1. ✨ **PWABuilder with page URL** (fastest, no setup)
2. 📄 **GitHub Gist** (if manifest URL required)
3. 📦 **Combined .aab you already have** (but not recommended - should split into 2 apps)

**My recommendation: Use Method 1 - it's the simplest!**

The customer and driver interfaces are already built at:
- Customer: https://returnit.online/customer-mobile-app
- Driver: https://returnit.online/mobile-driver

PWABuilder will scan these pages and create the apps automatically! 🎉
