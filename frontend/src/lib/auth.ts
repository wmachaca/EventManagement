// auth.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios, { AxiosError } from 'axios';

// Environment validation
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth environment variables');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET');
}

// Google Provider Configuration
const googleProviderConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code',
      scope: 'openid email profile',
    },
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (res.data.token) {
            return {
              id: res.data.userId,
              email: res.data.user.email,
              name: res.data.user.name,
              token: res.data.token,
            };
          }
          return null;
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          const msg = err.response?.data?.message || 'Login failed';
          throw new Error(msg);
        }
      },
    }),

    GoogleProvider(googleProviderConfig),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google provider specifically
      if (account?.provider === 'google') {
        try {
          // Send the Google access token and ID token to your backend
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            accessToken: account.access_token,
            idToken: account.id_token,
          });

          // If successful, attach the backend JWT token and user info
          if (!response.data?.token) {
            console.error('Google login failed - no token returned');
            return false;
          }

          // Attach backend token to user object
          user.token = response.data.token;
          user.id = response.data.userId;

          return true;
        } catch (error) {
          console.error('Google auth backend error:', error);
          return false; // Reject sign-in if there's an issue with the backend
        }
      }

      // For credentials provider, just continue
      return true; // Proceed with sign-in if successful
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        // On first login, attach user info to the token
        // Type assertion since we've declared User.id as number
        const typedUser = user as { id: number; token?: string; name?: string };

        token.userId = typedUser.id; // Now definitely a number
        token.accessToken = typedUser.token;
        token.name = typedUser.name;
      }

      // For Google provider, store provider info
      if (account?.provider === 'google') {
        // Store Google account information in the token
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token.userId) {
        session.user.id = token.userId; // No need to cast - types match
      }
      if (token.name) {
        session.user.name = token.name;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  // Session configuration
  session: {
    strategy: 'jwt', // Recommended for better security
    maxAge: 1 * 24 * 60 * 60, // 1 days
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('[OAuth Error]', code, metadata);
    },
    warn(code) {
      console.warn('[OAuth Warning]', code);
    },
    debug(code, metadata) {
      console.log('[OAuth Debug]', code, metadata);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
