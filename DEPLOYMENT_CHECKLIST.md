# Production Deployment Checklist for returnit.online

## 🔐 Authentication Setup (CRITICAL)

### Google Cloud Console Configuration Required:
- [ ] **Authorized redirect URIs**:
  - `https://returnit.online/api/auth/google/callback`
  - `https://returnly.tech/api/auth/google/callback`
  
- [ ] **Authorized JavaScript origins**:
  - `https://returnit.online`
  - `https://returnly.tech`

**Without these, OAuth login will fail in production!**

## 🚀 Environment Variables

Ensure these are set in production:
- [ ] `NODE_ENV=production`
- [ ] `GOOGLE_CLIENT_ID` 
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `SESSION_SECRET` (same as development)
- [ ] `DATABASE_URL` (Neon production database)
- [ ] `STRIPE_SECRET_KEY`

## 🔧 Code Changes (Already Implemented)

- [x] Trust proxy setting for HTTPS cookies
- [x] Production OAuth callback URLs
- [x] Secure session configuration  
- [x] CORS handling for production domain

## 📋 Testing After Deployment

1. [ ] Visit https://returnit.online
2. [ ] Test Google OAuth login
3. [ ] Verify admin account access (nabeelmumtaz92@gmail.com, nabeelmumtaz4.2@gmail.com)
4. [ ] Check session persistence across page reloads
5. [ ] Test all major features work on production domain

## 🐛 Common Production Issues

**"redirect_uri_mismatch"** → Add exact URLs to Google Console
**"origin_mismatch"** → Add domains to JavaScript origins  
**"Access blocked"** → Check both redirect URIs AND origins
**Cookies not working** → Verify HTTPS and trust proxy setting

## 📞 Support

If authentication still fails after Google setup:
1. Check browser DevTools → Network for error details
2. Verify Google Console URLs match exactly
3. Check production environment variables are set
4. Review server logs for authentication errors

Ready for production deployment! 🎉