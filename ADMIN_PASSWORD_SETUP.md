# 🔐 Secure Admin Password System - Setup Guide

## Overview

A secure password system has been implemented for admin authentication with the following features:

- **Bcrypt encryption** (cost factor: 12)
- **Rate limiting** (5 attempts per minute)
- **Token versioning** (invalidates sessions on password change)
- **Offline recovery** (signed token reset capability)
- **Session-based verification**

---

## 📂 Files Created

1. **shared/schema.ts** - Added `adminPasswords` and `resetNonces` tables
2. **server/services/adminPasswordService.ts** - Core password management service
3. **server/routes/adminPasswordRoutes.ts** - API endpoints for password operations
4. **server/scripts/initAdminPassword.ts** - Initialization script (**YOU NEED TO EDIT THIS**)
5. **server/routes.ts** - Routes connected to `/api/admin/password`

---

## 🚀 Setup Instructions

### Step 1: Push Database Schema

Run this command to create the new database tables:

```bash
npm run db:push -- --force
```

This creates two new tables:
- `admin_passwords` - Stores bcrypt password hashes
- `reset_nonces` - Prevents replay attacks for offline resets

---

### Step 2: Enter Your Secure Password

Open the file: **`server/scripts/initAdminPassword.ts`**

Find these lines:

```typescript
// Line ~19
const SECURE_PASSWORD = "YOUR_PASSWORD_HERE"; // <-- REPLACE THIS

// Line ~38
const ADMIN_EMAIL = "your-admin@email.com"; // <-- UPDATE THIS
```

**Replace:**
1. `"YOUR_PASSWORD_HERE"` with your actual secure password (minimum 12 characters)
2. `"your-admin@email.com"` with your admin email address

---

### Step 3: Run the Initialization Script

```bash
npx tsx server/scripts/initAdminPassword.ts
```

**Expected output:**
```
🔐 Initializing Admin Password System...

✓ Found admin user: your@email.com (ID: 1)

🔒 Hashing password with bcrypt (cost factor: 12)...
✅ Admin password initialized successfully!

Next steps:
1. Test the password by making a POST request to /api/admin/password/verify
2. Delete or secure this script file
3. Never commit passwords to git!
```

---

## 🔑 API Endpoints

### 1. Verify Admin Password

**POST** `/api/admin/password/verify`

```json
{
  "adminUserId": 1,
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "tokenVersion": 1,
  "message": "Password verified successfully"
}
```

**Rate Limit:** 5 attempts per minute per IP

---

### 2. Change Admin Password

**POST** `/api/admin/password/change`

```json
{
  "adminUserId": 1,
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Notes:**
- New password must be at least 12 characters
- Automatically increments token version
- Invalidates all existing sessions

---

### 3. Offline Password Reset (Emergency)

**POST** `/api/admin/password/reset-signed`

```json
{
  "payload": {
    "iat": 1699999999,
    "exp": 1700000599,
    "nonce": "unique-nonce-123",
    "purpose": "reset",
    "adminUserId": 1,
    "newPassword": "new-secure-password"
  },
  "signature": "base64-signature",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
}
```

**Use case:** Emergency recovery when locked out

---

## 🔒 Security Features

### 1. Bcrypt Hashing
- Cost factor: 12 (recommended by OWASP)
- Passwords never stored in plain text
- Automatically salted

### 2. Rate Limiting
- 5 attempts per minute per IP address
- Prevents brute force attacks
- Returns 429 status code when exceeded

### 3. Token Versioning
- Incremented on every password change
- Old sessions automatically invalidated
- Prevents session reuse after password reset

### 4. Nonce Protection
- One-time use tokens for offline reset
- 10-minute expiration window
- Prevents replay attacks

---

## 🧪 Testing the System

### Test 1: Verify Password

```bash
curl -X POST http://localhost:5000/api/admin/password/verify \
  -H "Content-Type: application/json" \
  -d '{"adminUserId": 1, "password": "your-password"}'
```

### Test 2: Change Password

```bash
curl -X POST http://localhost:5000/api/admin/password/change \
  -H "Content-Type: application/json" \
  -d '{
    "adminUserId": 1,
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }'
```

---

## ⚠️ Important Security Notes

1. **Never commit passwords** - Keep `initAdminPassword.ts` out of git or delete after use
2. **Use strong passwords** - Minimum 12 characters, mix of uppercase, lowercase, numbers, symbols
3. **Secure the script** - Delete or protect `initAdminPassword.ts` after initialization
4. **Monitor rate limits** - Check logs for suspicious activity
5. **Rotate passwords regularly** - Use the change password endpoint

---

## 📝 Integration with Existing Auth

The system is designed to work **alongside** your existing Passport.js authentication:

1. **Regular authentication** - Uses Passport.js (Google, Apple, Email/Password)
2. **Admin password** - Additional layer for sensitive admin operations
3. **Session storage** - Stores `adminPasswordVerified` flag in session after verification
4. **Token versioning** - Syncs with existing user token versioning system

---

## 🛠️ Troubleshooting

### Error: "Admin not found"
- Check that `ADMIN_EMAIL` matches a user in the database
- Verify the user has `isAdmin: true` flag

### Error: "Password must be at least 12 characters"
- Update your password to meet minimum length requirement

### Error: "Too many attempts"
- Wait 60 seconds before trying again
- Check IP address restrictions

### Database connection errors
- Ensure `npm run db:push` completed successfully
- Check DATABASE_URL environment variable

---

## 📧 Questions?

If you need help or have questions about the secure admin password system, please reach out!

**Next Step:** Go to `server/scripts/initAdminPassword.ts` and enter your secure password! 🔐
