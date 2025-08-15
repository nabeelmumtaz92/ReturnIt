# Mobile App Access Control Configuration

## Current Setup

Your email `nabeelmumtaz92@gmail.com` has been configured as the exclusive testing account for mobile apps.

## Environment Configurations

### Development Mode (Current)
- **NODE_ENV**: development
- **Access**: Open for all users (testing purposes)
- **Mobile Apps**: Available to everyone for development

### Production Mode
- **NODE_ENV**: production
- **Access**: Restricted to whitelist only
- **Mobile Apps**: Only accessible to `nabeelmumtaz92@gmail.com`
- **Features Disabled**: Public registration, login, Google auth, driver signup

### Staging Mode
- **NODE_ENV**: staging
- **Access**: Limited whitelist access
- **Mobile Apps**: Only accessible to `nabeelmumtaz92@gmail.com`
- **Features**: Login and Google auth enabled for whitelisted users

## How to Enable Restricted Access

### Option 1: Set Environment Variable
```bash
export NODE_ENV=production
```

### Option 2: Custom Configuration
Set the `RETURNLY_ENV_CONFIG` environment variable:
```bash
export RETURNLY_ENV_CONFIG='{"allowPublicRegistration":false,"allowPublicLogin":false,"allowGoogleAuth":false,"allowDriverSignup":false,"enableDemoMode":true,"restrictToWhitelist":true,"whitelistedEmails":["nabeelmumtaz92@gmail.com"]}'
```

## What Happens in Restricted Mode

1. **Web Platform**: Shows "Public authentication disabled" notice
2. **Mobile Apps**: Shows "Mobile App Testing Access" notice for non-authorized users
3. **Authentication**: Only `nabeelmumtaz92@gmail.com` can register/login
4. **API Endpoints**: Return 403 Forbidden for non-whitelisted emails

## Testing Your Exclusive Access

When in production/staging mode:
- ✅ Your email can access all features
- ❌ Other emails cannot register or login
- ✅ Mobile apps work normally for your account
- ❌ Mobile apps show access restriction notice for others

## Current Whitelisted Accounts

**Production & Staging:**
- `nabeelmumtaz92@gmail.com` (Primary testing account)
- `admin@returnly.tech` (Admin backup)
- `demo@returnly.tech` (Demo account)

**Development:**
- All emails allowed (for testing purposes)

## API Endpoint

Check current environment configuration:
```
GET /api/config/environment
```

Returns current access permissions and environment status.