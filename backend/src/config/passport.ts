// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../database/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

let agent: any = null;
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;

if (proxy) {
  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    agent = new HttpsProxyAgent(proxy);
    console.log('Using proxy agent for Google OAuth');
  } catch (err) {
    console.error('Proxy is set but https-proxy-agent is not installed.');
  }
} else {
  console.log('No proxy detected — running without agent');
}

const options = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: '/api/auth/google/callback',
  passReqToCallback: true,
};

const strategy = new GoogleStrategy(
  options,
  async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      console.log('Looking for user with email:', profile.emails[0].value);        
      const { id, displayName, emails } = profile;
      if (!emails || !emails[0]) throw new Error('No email found in Google profile');
      const email = emails[0].value;

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: displayName,
            email,
            googleId: id,
            provider: 'google',
          },
        });
      } else if (user.provider === 'credentials') {
        return done(null, false, { message: 'Email already registered with password' });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId: id, provider: 'google' },
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('Passport verification error:', error);
      return done(error, null);
    }
  },
);

if (agent) {
  // Only set proxy agent if needed (Linux behind proxy)  
  strategy._oauth2.setAgent(agent);
}

passport.use(strategy);

// Serialize user into session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
