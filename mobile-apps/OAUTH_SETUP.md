# Social OAuth Setup Guide for ReturnIt Mobile Apps

This document provides step-by-step instructions for setting up Google, Facebook, and Apple OAuth authentication for the ReturnIt Customer mobile app.

## ✅ Google OAuth (Currently Implemented)

### Status: **Partially Configured**

### Current Setup:
- Backend endpoint: `/api/auth/google/mobile` ✅
- Frontend screen: `SocialLoginScreen.js` ✅
- Navigation: Wired in `App.js` ✅

### Required Configuration:

1. **Update app.json**:
   ```json
   "extra": {
     "googleClientId": "YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
   }
   ```

2. **Google Cloud Console Setup**:
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials (if not exists)
   - Add authorized redirect URIs:
     - Production: `https://returnit.online/api/auth/google/callback`
     - Mobile (Expo proxy): `https://auth.expo.io/@your-username/returnit-customer`
     - Custom scheme: `returnit-customer://oauthredirect`

3. **Environment Variables** (Backend):
   - `GOOGLE_CLIENT_ID` (already exists)
   - `GOOGLE_CLIENT_SECRET` (already exists)

### Testing:
1. Update `app.json` with real Google Client ID
2. Run: `cd mobile-apps/returnit-customer && npm run start`
3. Tap "Continue with Google" on login screen
4. Complete OAuth flow in browser
5. Verify redirect back to app

---

## 📘 Facebook OAuth Setup

### Status: **Not Configured**

### Required Setup:

#### 1. Facebook Developer Portal
- Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
- Enable "Facebook Login" product
- Configure OAuth settings:
  - Valid OAuth Redirect URIs:
    - `https://returnit.online/api/auth/facebook/callback`
    - `https://auth.expo.io/@your-username/returnit-customer`
  - Valid JavaScript Origins:
    - `https://returnit.online`

#### 2. Environment Variables (Add to Replit Secrets)
```bash
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

#### 3. Update app.json
```json
"extra": {
  "facebookAppId": "YOUR_FACEBOOK_APP_ID",
  "facebookDisplayName": "ReturnIt"
}
```

#### 4. Install Dependencies
```bash
cd mobile-apps/returnit-customer
npx expo install react-native-fbsdk-next
```

#### 5. Update app.json plugins
```json
"plugins": [
  [
    "react-native-fbsdk-next",
    {
      "appID": "YOUR_FACEBOOK_APP_ID",
      "clientToken": "YOUR_FACEBOOK_CLIENT_TOKEN",
      "displayName": "ReturnIt",
      "scheme": "fb{your-app-id}",
      "advertiserIDCollectionEnabled": false,
      "autoLogAppEventsEnabled": false,
      "isAutoInitEnabled": true
    }
  ]
]
```

#### 6. Backend Endpoint (Already Implemented)
- Web: `/api/auth/facebook` and `/api/auth/facebook/callback`
- Mobile: Need to create `/api/auth/facebook/mobile` endpoint (similar to Google)

#### 7. Update SocialLoginScreen.js
Replace the placeholder `signInWithFacebook` function with:
```javascript
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

const signInWithFacebook = async () => {
  try {
    setLoading(true);
    setProvider('facebook');
    
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    
    if (result.isCancelled) {
      setLoading(false);
      return;
    }
    
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw new Error('Failed to get access token');
    }
    
    // Send access token to backend
    const authResponse = await apiClient.request('/api/auth/facebook/mobile', {
      method: 'POST',
      body: { accessToken: data.accessToken },
    });
    
    if (authResponse.user) {
      await authService.setAuthenticated(authResponse.user);
      navigation.replace('Home');
    }
  } catch (error) {
    Alert.alert('Facebook Login Failed', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🍎 Apple Sign-In Setup

### Status: **Not Configured**

### Required Setup:

#### 1. Apple Developer Account
- Requires paid Apple Developer Program membership ($99/year)
- Configure "Sign in with Apple" capability
- Register App ID with Sign in with Apple enabled

#### 2. Install Dependencies
```bash
cd mobile-apps/returnit-customer
npx expo install expo-apple-authentication
```

#### 3. Update app.json
```json
"ios": {
  "bundleIdentifier": "com.returnit.customer",
  "usesAppleSignIn": true
}
```

#### 4. Update SocialLoginScreen.js
Replace the placeholder `signInWithApple` function with:
```javascript
import * as AppleAuthentication from 'expo-apple-authentication';

const signInWithApple = async () => {
  if (Platform.OS !== 'ios') {
    Alert.alert('Not Available', 'Apple Sign-In is only available on iOS');
    return;
  }
  
  try {
    setLoading(true);
    setProvider('apple');
    
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    // Send credential to backend
    const authResponse = await apiClient.request('/api/auth/apple/mobile', {
      method: 'POST',
      body: {
        identityToken: credential.identityToken,
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      },
    });
    
    if (authResponse.user) {
      await authService.setAuthenticated(authResponse.user);
      navigation.replace('Home');
    }
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      setLoading(false);
      return;
    }
    Alert.alert('Apple Sign-In Failed', error.message);
  } finally {
    setLoading(false);
  }
};
```

#### 5. Backend Endpoint
Create `/api/auth/apple/mobile` in `server/routes.ts`:
```typescript
app.post('/api/auth/apple/mobile', async (req, res) => {
  try {
    const { identityToken, email, user, fullName } = req.body;
    
    // Verify Apple identity token with Apple's public key
    // (Implementation requires apple-signin-auth or similar library)
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    
    if (!existingUser) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Please create an account first',
        email,
      });
    }
    
    // Create session
    req.session.user = {
      id: existingUser.id,
      email: existingUser.email,
      // ... other fields
    };
    
    return res.json({ success: true, user: req.session.user });
  } catch (error) {
    console.error('Apple auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});
```

---

## 🧪 Testing OAuth Flows

### Development Testing:
1. **Expo Go** (Limited):
   - Google: ✅ Works with expo-auth-session
   - Facebook: ❌ Requires custom development build
   - Apple: ❌ Requires custom development build

2. **EAS Development Build** (Recommended):
   ```bash
   cd mobile-apps/returnit-customer
   eas build --profile development --platform ios
   eas build --profile development --platform android
   ```

### Production Testing:
```bash
# Build production apps
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 🔒 Security Considerations

1. **Never expose client secrets in mobile code**
   - All token exchanges happen on backend
   - Mobile only sends authorization codes or access tokens

2. **User existence check**
   - Backend validates user exists before creating session
   - Prevents auto-creation of unauthorized accounts
   - Master admin exception for first-time setup

3. **Session security**
   - Session stored server-side in PostgreSQL
   - Mobile apps should implement token-based auth for production

4. **HTTPS Only**
   - All OAuth callbacks require HTTPS
   - Development: Use Expo's HTTPS tunnel
   - Production: SSL certificate required

---

## 📋 Checklist Before App Store Submission

### Google OAuth:
- [ ] Real Google Client ID in app.json
- [ ] Production redirect URIs in Google Cloud Console
- [ ] Test OAuth flow on physical device
- [ ] Privacy policy URL configured

### Facebook OAuth:
- [ ] Facebook App approved for production
- [ ] Privacy policy and terms of service URLs
- [ ] Data deletion callback URL configured
- [ ] Test on physical device (Facebook rejects simulators)

### Apple Sign-In:
- [ ] Apple Developer account active
- [ ] App ID has Sign in with Apple capability
- [ ] Identity token verification implemented
- [ ] Tested on physical iOS device

---

## 🆘 Support

For OAuth setup assistance:
- Google: [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- Facebook: [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)
- Apple: [Sign in with Apple Docs](https://developer.apple.com/sign-in-with-apple/)
- Expo: [Authentication Guide](https://docs.expo.dev/develop/authentication/)
