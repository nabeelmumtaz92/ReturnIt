# Google OAuth Production Setup Guide

## Current Issue
Login works on development (Replit URL) but fails on production domain (returnit.online) because Google OAuth requires exact callback URLs to be registered.

## Required Google Cloud Console Configuration

### 1. Access Google Cloud Console
- Go to https://console.cloud.google.com/
- Select your project (or create one if needed)
- Navigate to "APIs & Services" > "Credentials"

### 2. Update OAuth 2.0 Client ID

Find your existing OAuth client and add these **Authorized redirect URIs**:

```
https://returnit.online/api/auth/google/callback
https://returnly.tech/api/auth/google/callback
https://31d2e9c8-ee18-4d8b-a694-284850544705-00-2mu2k62ukku0q.janeway.replit.dev/api/auth/google/callback
```

### 3. Update Authorized Origins

Add these **Authorized JavaScript origins**:

```
https://returnit.online
https://returnly.tech
https://31d2e9c8-ee18-4d8b-a694-284850544705-00-2mu2k62ukku0q.janeway.replit.dev
```

## Code Changes Made

✅ **Trust Proxy Setting Added**
- Added `app.set('trust proxy', 1)` in server/index.ts
- This allows secure cookies behind Replit's proxy

✅ **Production Callback URL Support**
- Updated server/auth/strategies.ts to use `https://returnit.online/api/auth/google/callback` in production
- Development and staging URLs still supported

✅ **Optimized Session Cookies**
- Set `secure: true` for production HTTPS
- Set `sameSite: 'lax'` for proper cross-site navigation
- Let browser handle domain automatically

## Testing After Setup

1. **Update Google Cloud Console** with the URLs above
2. **Deploy to production** (the code changes are ready)
3. **Test login flow** at https://returnit.online

## Common Issues & Solutions

**Issue**: "redirect_uri_mismatch" error
**Solution**: Ensure exact URL match in Google Cloud Console (including https:// and trailing path)

**Issue**: Cookies not being set
**Solution**: Verify HTTPS is working and `trust proxy` setting is active

**Issue**: CORS errors
**Solution**: Check that returnit.online is in Authorized Origins

## Environment Variables Needed

Make sure these are set in production:
- `NODE_ENV=production`
- `GOOGLE_CLIENT_ID` (your Google OAuth client ID)
- `GOOGLE_CLIENT_SECRET` (your Google OAuth client secret)
- `SESSION_SECRET` (same secret used in development)

## Next Steps

1. Add the redirect URIs to Google Cloud Console
2. Test the login flow on returnit.online
3. Verify that admin accounts (nabeelmumtaz92@gmail.com, nabeelmumtaz4.2@gmail.com) can access the admin dashboard

The backend is now configured to handle production authentication properly!