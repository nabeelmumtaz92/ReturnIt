# Staging Environment Access

## Overview
The staging environment (returnly.tech) is protected with HTTP Basic Authentication to prevent unauthorized access during development and testing.

## Access Credentials

### Default Credentials
- **Username**: `returnly`
- **Password**: `staging2025`

### Custom Credentials
You can set custom credentials using environment variables:
- `STAGING_USERNAME` - Custom staging username
- `STAGING_PASSWORD` - Custom staging password

## How It Works

1. **Domain Detection**: Authentication only applies to `returnly.tech` domain
2. **Production Unaffected**: `returnit.online` (production) remains publicly accessible
3. **Browser Prompt**: Visiting returnly.tech will show a browser login prompt
4. **All Pages Protected**: Every page and API endpoint on staging requires authentication

## Accessing Staging

1. Navigate to `https://returnly.tech`
2. Enter credentials when prompted:
   - Username: `returnly`
   - Password: `staging2025`
3. Proceed to use the staging environment normally

## Security Features

- **Domain-Specific**: Only affects staging domain
- **HTTP Basic Auth**: Standard browser authentication
- **Environment Variables**: Credentials configurable via environment
- **All Requests Protected**: Covers both web pages and API calls

## Managing Access

### For Development Team
Share these credentials securely with authorized team members who need staging access.

### For Client Testing
Provide temporary credentials for client review sessions on staging environment.

### Updating Credentials
Update the environment variables `STAGING_USERNAME` and `STAGING_PASSWORD` in your deployment configuration.

## Implementation Details

The authentication is implemented as Express middleware that:
- Checks the request hostname
- Applies Basic Auth only to `returnly.tech`
- Allows production traffic to flow normally
- Provides clear error messages for invalid credentials

This ensures your staging environment stays secure while keeping production accessible to customers.