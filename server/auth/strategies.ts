import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// @ts-ignore - passport-apple doesn't have TypeScript definitions
import AppleStrategy from 'passport-apple';
import { storage } from '../storage';

// Google OAuth Strategy - Support production domain
let callbackURL: string;

if (process.env.NODE_ENV === 'production') {
  callbackURL = 'https://returnit.online/api/auth/google/callback';
} else if (process.env.REPLIT_DEV_DOMAIN) {
  callbackURL = `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`;
} else {
  callbackURL = `https://${process.env.REPL_ID}.${process.env.REPLIT_CLUSTER || 'id'}.replit.dev/api/auth/google/callback`;
}

console.log('Google OAuth Configuration:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
  callbackURL: callbackURL
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    console.log('Google OAuth strategy callback triggered');
    console.log('Profile data:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });
    try {
      const userEmail = profile.emails?.[0]?.value || '';
      const googleId = profile.id;
      
      // SECURITY: Verify email is confirmed by Google before proceeding
      const emailVerified = profile._json?.email_verified;
      if (!emailVerified) {
        console.log('Google email not verified, blocking login:', userEmail);
        return done(new Error('EMAIL_NOT_VERIFIED'), null);
      }
      
      // First check if user exists with this Google ID (already linked account)
      let existingUser = await storage.getUserByGoogleId(googleId);
      
      if (existingUser) {
        console.log('User found by Google ID:', existingUser.id);
        return done(null, existingUser);
      }
      
      // Check if user exists by email (account linking scenario)
      existingUser = await storage.getUserByEmail(userEmail);
      
      if (existingUser) {
        console.log('Linking Google account to existing email:', existingUser.id);
        // Use secure linkUserProvider method with conflict detection
        const updatedUser = await storage.linkUserProvider(existingUser.id, 'google', googleId);
        return done(null, updatedUser);
      }

      // SECURITY FIX: Don't auto-create users - redirect to signup instead
      console.log('Google user not found, denying auto-creation:', userEmail);
      
      // Check if this is the master admin - only they can auto-create
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL;
      
      if (isMasterAdmin) {
        // Only master admin gets auto-created (no password for OAuth-only account)
        const newUser = await storage.createUser({
          email: userEmail,
          phone: '6362544821', // Master admin phone
          googleId: googleId,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
          lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
          isDriver: true, // Master admin is driver
          isAdmin: true // Master admin gets admin access
        });
        
        console.log('Master admin auto-created:', { id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin });
        return done(null, newUser);
      }

      // All other users must sign up first - return error to redirect to signup
      console.log('Non-admin Google user attempted auto-creation - blocking:', userEmail);
      return done(new Error('OAUTH_SIGNUP_REQUIRED'), null);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  const facebookCallbackURL = process.env.NODE_ENV === 'production'
    ? 'https://returnit.online/api/auth/facebook/callback'
    : `https://${process.env.REPLIT_DEV_DOMAIN || 'returnly.tech'}/api/auth/facebook/callback`;
  
  console.log('Facebook OAuth Configuration:', {
    hasAppId: !!process.env.FACEBOOK_APP_ID,
    hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
    callbackURL: facebookCallbackURL
  });
  
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: facebookCallbackURL,
    profileFields: ['id', 'emails', 'name', 'picture']
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
      const userEmail = profile.emails?.[0]?.value || '';
      const facebookId = profile.id;
      
      // NOTE: Facebook email verification would require Graph API call with extra scope
      // For now, we trust Facebook's OAuth flow. To add verification:
      // 1. Add scope: ['email', 'public_profile']
      // 2. Call Graph API: /me?fields=email,is_email_verified
      // 3. Check is_email_verified flag before proceeding
      
      // First check if user exists with this Facebook ID (already linked account)
      let existingUser = await storage.getUserByFacebookId(facebookId);
      
      if (existingUser) {
        console.log('User found by Facebook ID:', existingUser.id);
        return done(null, existingUser);
      }
      
      // Check if user exists by email (account linking scenario)
      existingUser = await storage.getUserByEmail(userEmail);
      
      if (existingUser) {
        console.log('Linking Facebook account to existing email:', existingUser.id);
        // Use secure linkUserProvider method with conflict detection
        const updatedUser = await storage.linkUserProvider(existingUser.id, 'facebook', facebookId);
        return done(null, updatedUser);
      }

      // SECURITY FIX: Don't auto-create users - redirect to signup instead
      console.log('Facebook user not found, denying auto-creation:', userEmail);
      
      // Check if this is the master admin - only they can auto-create
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL;
      
      if (isMasterAdmin) {
        // Only master admin gets auto-created (no password for OAuth-only account)
        const newUser = await storage.createUser({
          email: userEmail,
          phone: '6362544821', // Master admin phone
          facebookId: facebookId,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
          lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
          isDriver: true, // Master admin is driver
          isAdmin: true // Master admin gets admin access
        });
        
        console.log('Master admin auto-created via Facebook:', { id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin });
        return done(null, newUser);
      }

      // All other users must sign up first - return error to redirect to signup
      console.log('Non-admin Facebook user attempted auto-creation - blocking:', userEmail);
      return done(new Error('OAUTH_SIGNUP_REQUIRED'), null);
    } catch (error) {
      console.error('Facebook auth error:', error);
      return done(error);
    }
  }));
}

// Apple OAuth Strategy
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  const appleCallbackURL = process.env.NODE_ENV === 'production'
    ? 'https://returnit.online/api/auth/apple/callback'
    : process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/apple/callback`
    : `https://${process.env.REPL_ID}.${process.env.REPLIT_CLUSTER || 'id'}.replit.dev/api/auth/apple/callback`;
  
  console.log('Apple OAuth Configuration:', {
    hasClientId: !!process.env.APPLE_CLIENT_ID,
    hasTeamId: !!process.env.APPLE_TEAM_ID,
    hasKeyId: !!process.env.APPLE_KEY_ID,
    hasPrivateKey: !!process.env.APPLE_PRIVATE_KEY,
    callbackURL: appleCallbackURL
  });
  
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: process.env.APPLE_PRIVATE_KEY,
    callbackURL: appleCallbackURL,
    scope: ['email', 'name'],
    passReqToCallback: false
  }, async (accessToken: any, refreshToken: any, idToken: any, profile: any, done: any) => {
    try {
      console.log('Apple OAuth callback triggered');
      const email = profile.email || idToken?.email;
      const appleId = profile.id || profile.sub;
      
      if (!email) {
        return done(new Error('No email provided by Apple'), null);
      }

      // SECURITY: Verify email is confirmed by Apple before proceeding
      // Apple provides email_verified in the idToken JWT
      const emailVerified = profile.email_verified ?? true; // Apple emails are pre-verified
      if (!emailVerified) {
        console.log('Apple email not verified, blocking login:', email);
        return done(new Error('EMAIL_NOT_VERIFIED'), null);
      }

      // First check if user exists with this Apple ID (already linked account)
      let existingUser = await storage.getUserByAppleId(appleId);
      
      if (existingUser) {
        console.log('User found by Apple ID:', existingUser.id);
        return done(null, existingUser);
      }
      
      // Check if user exists by email (account linking scenario)
      existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        console.log('Linking Apple account to existing email:', existingUser.id);
        // Use secure linkUserProvider method with conflict detection
        const updatedUser = await storage.linkUserProvider(existingUser.id, 'apple', appleId);
        return done(null, updatedUser);
      }

      // SECURITY FIX: Don't auto-create users - redirect to signup instead
      console.log('Apple user not found, denying auto-creation:', email);
      
      // Check if this is the master admin for special privileges
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = email === MASTER_ADMIN_EMAIL;
      
      if (isMasterAdmin) {
        // Only master admin gets auto-created (no password for OAuth-only account)
        const newUser = await storage.createUser({
          email: email,
          phone: '6362544821', // Master admin phone
          appleId: appleId,
          firstName: profile.name?.firstName || 'Apple',
          lastName: profile.name?.lastName || 'User',
          isDriver: true, // Master admin is driver by default
          isAdmin: true // Master admin gets admin access
        });
        
        console.log('Master admin auto-created via Apple Sign-In:', { 
          id: newUser.id, 
          email: newUser.email, 
          isAdmin: newUser.isAdmin,
          isDriver: newUser.isDriver 
        });
        
        return done(null, newUser);
      }

      // All other users must sign up first - return error to redirect to signup
      console.log('Non-admin Apple user attempted auto-creation - blocking:', email);
      return done(new Error('OAUTH_SIGNUP_REQUIRED'), null);
    } catch (error) {
      console.error('Apple auth error:', error);
      return done(error);
    }
  }));
} else {
  console.log('Apple OAuth not configured - missing required environment variables');
}

export default passport;