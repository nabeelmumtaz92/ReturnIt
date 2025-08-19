import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as AppleStrategy } from 'passport-apple'; // Apple strategy requires custom setup
import { storage } from '../storage';

// Google OAuth Strategy
const callbackURL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`
  : `https://${process.env.REPL_ID}.${process.env.REPLIT_CLUSTER || 'id'}.replit.dev/api/auth/google/callback`;

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
      
      const adminEmails = ['nabeelmumtaz92@gmail.com', 'nabeelmumtaz4.2@gmail.com'];
      const newUser = await storage.createUser({
        email: userEmail,
        phone: adminEmails.includes(userEmail) ? '6362544821' : '', // Admin gets phone number
        password: 'GOOGLE_AUTH_USER', // Social auth placeholder
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
        lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
        isDriver: adminEmails.includes(userEmail), // Admins are also drivers for testing
        isAdmin: adminEmails.includes(userEmail) // Admin access for both emails
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