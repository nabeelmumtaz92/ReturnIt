import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as AppleStrategy } from 'passport-apple'; // Apple strategy requires custom setup
import { storage } from '../storage';

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingUser) {
        return done(null, existingUser);
      }

      // Create new user
      const newUser = await storage.createUser({
        username: profile.displayName || profile.id,
        email: profile.emails?.[0]?.value || '',
        password: '', // Social auth doesn't need password
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImage: profile.photos?.[0]?.value || ''
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingUser) {
        return done(null, existingUser);
      }

      // Create new user
      const newUser = await storage.createUser({
        username: profile.displayName || profile.id,
        email: profile.emails?.[0]?.value || '',
        password: '', // Social auth doesn't need password
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImage: profile.photos?.[0]?.value || ''
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

// Apple OAuth Strategy would be configured here when Apple credentials are provided
// Apple Sign-In requires specialized setup with JWT tokens and certificates

export default passport;