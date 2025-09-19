import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as AppleStrategy } from 'passport-apple'; // Apple strategy requires custom setup
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
    callbackURL: callbackURL
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

      // Create new user with Google profile data
      const userEmail = profile.emails?.[0]?.value || `${profile.id}@google.temp`;
      console.log('Creating new Google user:', userEmail);
      
      const { shouldAutoAssignAdmin, MASTER_ADMIN_EMAIL } = await import('../auth/adminControl');
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL;
      
      const newUser = await storage.createUser({
        email: userEmail,
        phone: isMasterAdmin ? '6362544821' : '', // Only master admin gets phone number
        password: 'GOOGLE_AUTH_USER', // Social auth placeholder
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
        lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
        isDriver: isMasterAdmin, // Only master admin is driver by default
        isAdmin: shouldAutoAssignAdmin(userEmail) // ONLY master admin gets automatic admin access
      });
      
      console.log('New user created:', { id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin });

      return done(null, newUser);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
      ? 'https://returnit.online/api/auth/facebook/callback'
      : 'https://returnly.tech/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture']
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
      // Check if user exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingUser) {
        return done(null, existingUser);
      }

      // Create new user - simplified for basic schema
      const newUser = await storage.createUser({
        email: profile.emails?.[0]?.value || `${profile.id}@facebook.temp`,
        phone: '', // Social auth users need to add phone later
        password: 'FACEBOOK_AUTH_USER' // Social auth placeholder
      });

      return done(null, newUser);
    } catch (error) {
      console.error('Facebook auth error:', error);
      return done(error);
    }
  }));
}

// Apple OAuth Strategy would be configured here when Apple credentials are provided
// Apple Sign-In requires specialized setup with JWT tokens and certificates

export default passport;