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
      // Check if user exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingUser) {
        return done(null, existingUser);
      }

      // SECURITY FIX: Don't auto-create users - redirect to signup instead
      const userEmail = profile.emails?.[0]?.value || `${profile.id}@google.temp`;
      console.log('Google user not found, denying auto-creation:', userEmail);
      
      // Check if this is the master admin - only they can auto-create
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL;
      
      if (isMasterAdmin) {
        // Only master admin gets auto-created
        const newUser = await storage.createUser({
          email: userEmail,
          phone: '6362544821', // Master admin phone
          password: 'GOOGLE_AUTH_USER', // Social auth placeholder
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
      // Check if user exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingUser) {
        return done(null, existingUser);
      }

      // SECURITY FIX: Don't auto-create users - redirect to signup instead
      const userEmail = profile.emails?.[0]?.value || `${profile.id}@facebook.temp`;
      console.log('Facebook user not found, denying auto-creation:', userEmail);
      
      // Check if this is the master admin - only they can auto-create
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL;
      
      if (isMasterAdmin) {
        // Only master admin gets auto-created
        const newUser = await storage.createUser({
          email: userEmail,
          phone: '6362544821', // Master admin phone
          password: 'FACEBOOK_AUTH_USER', // Social auth placeholder
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
      
      if (!email) {
        return done(new Error('No email provided by Apple'), null);
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        console.log('Apple user found, logging in:', email);
        return done(null, existingUser);
      }

      // Auto-create new user from Apple Sign-In
      console.log('Apple user not found, creating new account:', email);
      
      // Check if this is the master admin for special privileges
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = email === MASTER_ADMIN_EMAIL;
      
      // Generate cryptographically secure random password for OAuth users
      // This prevents email/password login - users MUST use Apple Sign-In
      const crypto = await import('crypto');
      const randomPassword = crypto.randomBytes(32).toString('hex'); // 64 character random string
      
      // Create new user account with Apple profile data
      const newUser = await storage.createUser({
        email: email,
        phone: isMasterAdmin ? '6362544821' : '', // Master admin phone, others can add later
        password: randomPassword, // Secure random password - user can't login with email/password
        firstName: profile.name?.firstName || 'Apple',
        lastName: profile.name?.lastName || 'User',
        isDriver: isMasterAdmin, // Only master admin is driver by default
        isAdmin: isMasterAdmin // Only master admin gets admin access
      });
      
      console.log('New user created via Apple Sign-In:', { 
        id: newUser.id, 
        email: newUser.email, 
        isAdmin: newUser.isAdmin,
        isDriver: newUser.isDriver 
      });
      
      return done(null, newUser);
    } catch (error) {
      console.error('Apple auth error:', error);
      return done(error);
    }
  }));
} else {
  console.log('Apple OAuth not configured - missing required environment variables');
}

export default passport;