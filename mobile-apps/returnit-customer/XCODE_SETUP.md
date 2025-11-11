# ReturnIt Customer App - Xcode Setup Guide

This guide will help you build and run the ReturnIt customer app on your iPhone using Xcode.

## Prerequisites

- **Mac computer** with Xcode installed (get it from the Mac App Store)
- **iPhone** with USB cable
- **Apple ID** (free account works for personal testing)

## Step 1: Pull Latest Changes

Open PowerShell on your Windows machine and sync the latest code:

```powershell
cd C:\Users\nsm21\Desktop\ReturnIt
git pull
```

## Step 2: Transfer Project to Mac

**IMPORTANT:** The iOS build process requires macOS. Copy the entire `mobile-apps/returnit-customer` folder to your Mac now.

You can use:
- USB drive
- AirDrop
- GitHub (already synced - just `git pull` on Mac)
- Cloud storage (iCloud, Google Drive, etc.)

## Step 3: Install Dependencies (on Mac)

Open Terminal on your Mac and navigate to the customer app folder:

```bash
cd ~/path/to/returnit-customer
npm install --legacy-peer-deps
```

## Step 4: Generate Native iOS Folder (on Mac)

This command creates the `ios/` folder with the Xcode project:

```bash
npx expo prebuild --platform ios --clean
```

**What this does:**
- Creates `ios/` directory with native Xcode project
- Runs CocoaPods to install native dependencies
- Configures all Expo modules for native compilation
- Sets up proper iOS permissions and configurations
- Keeps all your existing app features intact

**This will take 2-5 minutes** as it downloads and links native iOS libraries.

## Step 5: Open in Xcode

On your Mac:

1. Navigate to the customer app folder
2. Open `ios/ReturnItCustomer.xcworkspace` (NOT the .xcodeproj file!)
3. Wait for Xcode to index the project (shows in top status bar)

## Step 6: Configure Signing

In Xcode:

1. Click on the project name in the left sidebar (blue icon)
2. Select "ReturnItCustomer" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Apple ID under "Team"
   - If you don't see your Apple ID, click "Add Account..." and sign in
6. You'll see the bundle identifier: `com.returnit.customer`

**Note:** With a free Apple account, the app will expire after 7 days and need to be rebuilt.

## Step 7: Connect Your iPhone

1. Plug your iPhone into the Mac via USB
2. On your iPhone: Tap "Trust" when prompted
3. In Xcode top bar, click the device dropdown (next to play/stop buttons)
4. Select your iPhone from the list

**For iOS 16+:** You must enable Developer Mode on your iPhone:
- Go to Settings → Privacy & Security → Developer Mode
- Toggle it ON
- Restart your iPhone when prompted

## Step 8: Build & Run

1. In Xcode, press the ▶️ Play button (or Cmd+R)
2. Xcode will:
   - Compile the app
   - Install it on your iPhone
   - Launch it automatically
3. First time: On your iPhone, go to Settings → General → VPN & Device Management
4. Tap on your Apple ID and select "Trust"
5. Return to home screen and tap the ReturnIt app icon

## Step 9: Start Development Server

On your Mac, start the Metro bundler in a new Terminal window:

```bash
cd ~/path/to/returnit-customer
npx expo start --dev-client
```

The app on your iPhone will automatically connect to the development server and load.

**Alternative:** You can also run the dev server from your Windows machine - the iPhone will connect over the network. Just make sure both devices are on the same WiFi network.

## Troubleshooting

### Build Errors

**"Provisioning profile doesn't include signing certificate"**
- Go to Xcode → Preferences → Accounts
- Select your Apple ID → Manage Certificates
- Click + → iOS Development
- Try building again

**"Failed to register bundle identifier"**
- The bundle ID `com.returnit.customer` might be taken
- Change it in app.json: `"bundleIdentifier": "com.returnit.customer.yourname"`
- Run `npx expo prebuild --clean` again

### App Won't Install

**"Untrusted Developer"**
- Go to Settings → General → VPN & Device Management
- Tap your Apple ID
- Select "Trust"

**"Unable to install"**
- Delete the app from your iPhone if it exists
- Clean build folder: Xcode → Product → Clean Build Folder
- Try again

### App Crashes on Launch

**Check Metro bundler logs** - Look for red error messages in the Terminal window

**Clear cache:**
```bash
npx expo start --dev-client --clear
```

## Development Workflow

Once set up, you have two options:

### Option A: Develop on Mac
1. **Make code changes** in VS Code on Mac
2. **Save files** - Metro bundler detects changes
3. **App reloads** automatically on your iPhone
4. **For native changes** (permissions, plugins, etc.):
   - Run `npx expo prebuild --clean` again on Mac
   - Rebuild in Xcode

### Option B: Develop on Windows (Sync via GitHub)
1. **Make code changes** on Windows in VS Code
2. **Commit and push** to GitHub
3. **Pull on Mac** - `git pull`
4. **Metro bundler** auto-reloads the app
5. **For native changes**:
   - Pull changes on Mac
   - Run `npx expo prebuild --clean` on Mac
   - Rebuild in Xcode

## What You Can Test

With the app running on your real iPhone, you can now test:

✅ Camera (photo verification for returns)  
✅ Location services (pickup address selection)  
✅ Google Maps integration  
✅ Stripe payment processing  
✅ Full booking flow (returns, exchanges, donations)  
✅ Authentication (Google, Apple, Email)  
✅ Real-time tracking  
✅ Push notifications  

Everything works exactly as it will in production!

## Next Steps: Production Build

When you're ready to publish to the App Store:

1. **Enroll in Apple Developer Program** ($99/year)
2. **Use EAS Build** for production builds:
   ```bash
   eas build --platform ios --profile production
   ```
3. **Submit to App Store** via EAS Submit or Xcode

## Support

If you run into issues:
- Check the [Expo docs](https://docs.expo.dev/bare/installing-expo-modules/)
- Xcode errors: Search the exact error message
- Most common issues are signing/provisioning related
