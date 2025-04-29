// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy} from 'passport-google-oauth20';
import { prisma } from '../database/client';
import dotenv from 'dotenv';
import type { Request } from 'express';

// Initialize environment
dotenv.config();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!JWT_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required environment variables');
}

// Optional proxy configuration (only loaded if needed)
let agent: any = null;
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;

if (proxy) {
  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    agent = new HttpsProxyAgent(proxy);
    console.log('Using proxy agent for Google OAuth');
  } catch (err) {
    console.error('Proxy config skipped - https-proxy-agent not installed');
  }
} else {
  console.log('No proxy detected - running without agent');
}

// Google Strategy
const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true,
  },
  async (
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ) => {
    try {
      console.log('Authenticating Google user:', profile.emails[0].value);

      const { id: googleId, displayName, emails } = profile;
      const email = emails[0]?.value;

      if (!email) {
        throw new Error('No email found in Google profile');
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: displayName,
            email,
            googleId,
            provider: 'google',
          },
        });
      } else if (user.provider === 'credentials') {
        return done(null, false, { 
          message: 'This email is already registered with email/password' 
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, provider: 'google' },
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error instanceof Error ? error : new Error('Authentication failed'));
    }
  }
);

// Apply proxy if configured
if (agent) {
  // Type assertion needed for protected property
  (googleStrategy as any)._oauth2.setAgent(agent);
}

passport.use(googleStrategy);

// Session serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || undefined);
  } catch (error) {
    done(error instanceof Error ? error : new Error('User not found'));
  }
});

export default passport;