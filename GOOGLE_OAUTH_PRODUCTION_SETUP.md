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

### 3. Update Authorized JavaScript Origins (CRITICAL)

Add these **Authorized JavaScript origins** - this is essential for frontend OAuth to work:

```
https://returnit.online
https://returnly.tech
https://31d2e9c8-ee18-4d8b-a694-284850544705-00-2mu2k62ukku0q.janeway.replit.dev
```

**Why this matters**: Without these origins, the Google OAuth popup/redirect will be blocked by CORS policy, causing authentication to fail silently.

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

**Issue**: "origin_mismatch" or CORS errors  
**Solution**: Add your domain to **Authorized JavaScript Origins** (not just redirect URIs)

**Issue**: Google OAuth popup blocked or fails silently
**Solution**: Missing JavaScript origins - add all your domains to origins list

**Issue**: Cookies not being set
**Solution**: Verify HTTPS is working and `trust proxy` setting is active

**Issue**: "Access blocked" errors
**Solution**: Check that returnit.online is in BOTH Authorized Origins AND Redirect URIs

## Environment Variables Needed

Make sure these are set in production:
- `NODE_ENV=production`
- `GOOGLE_CLIENT_ID` (your Google OAuth client ID)
- `GOOGLE_CLIENT_SECRET` (your Google OAuth client secret)
- `SESSION_SECRET` (same secret used in development)

## Complete Setup Checklist

### In Google Cloud Console:
- [ ] Add `https://returnit.online/api/auth/google/callback` to **Authorized redirect URIs**
- [ ] Add `https://returnly.tech/api/auth/google/callback` to **Authorized redirect URIs**  
- [ ] Add `https://returnit.online` to **Authorized JavaScript origins**
- [ ] Add `https://returnly.tech` to **Authorized JavaScript origins**
- [ ] Add your dev URL to both redirect URIs and origins

### In Production:
- [ ] Deploy the updated code with trust proxy settings
- [ ] Verify `NODE_ENV=production` is set
- [ ] Test OAuth login flow at https://returnit.online

### Testing:
- [ ] Try Google OAuth login on returnit.online
- [ ] Verify admin accounts (nabeelmumtaz92@gmail.com, nabeelmumtaz4.2@gmail.com) get admin access
- [ ] Check that session cookies persist properly

**Critical**: Both redirect URIs AND JavaScript origins must be configured, or OAuth will fail with CORS/origin errors.

The backend is now configured to handle production authentication properly!