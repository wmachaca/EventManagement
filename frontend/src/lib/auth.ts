// auth.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios, { AxiosError } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent'; // Import the proxy agent

// Determine if there is a proxy set in the environment variables
const proxyUrl = process.env.HTTPS_PROXY;

let agent: any = null;
if (proxyUrl) {
  try {
    // Create proxy agent with proper typing
    agent = new HttpsProxyAgent({
      host: 'proxy.cnea.gob.ar',
      port: 1280,
      protocol: 'http:',
      timeout: 5000,
      keepAlive: true,
      maxSockets: 50,
      rejectUnauthorized: false
    });

    // Add required methods with proper typing
    agent.getName = () => 'HttpsProxyAgent';
    
    // Properly typed addRequest implementation
    agent.addRequest = function(req: any, options: any) {
      req.on('socket', (socket: any) => {
        socket.setTimeout(options.timeout || 5000);
      });
    };

    console.log('Proxy agent configured successfully');
  } catch (err) {
    console.error('Proxy configuration failed:', err);
    throw new Error('Proxy setup failed');
  }
}

//console.log(process.env.GOOGLE_CLIENT_ID);

// Add this right before the GoogleProvider configuration
/*console.log('Google Provider Config:', {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: !!process.env.GOOGLE_CLIENT_SECRET, // Logs "true" if exists (without exposing secret)
  proxy: !!agent, // Shows if proxy is enabled
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  authorizationParams: {
    prompt: 'consent',
    access_type: 'offline',
    response_type: 'code',
    scope: 'openid email profile',
  },
});*/

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
  /*
  httpOptions: agent ? { 
    agent: agent,
    timeout: 5000
  } : undefined*/
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
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          console.log('Login response from backend:', res.data);

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
      if (account?.provider === 'google') {
        console.log('Sending tokens to backend:', {
          accessToken: account.access_token,
          idToken: account.id_token,
          endpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
        });        
        try {
          // Send the Google access token and ID token to your backend
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              accessToken: account.access_token,
              idToken: account.id_token,
            }
          );

          // If successful, attach the backend JWT token and user info
          if (response.data.token) {
            user.token = response.data.token;
            user.id = response.data.userId;
          } else {
            console.error('Google login failed');
            return false; // Reject the sign-in if backend fails
          }
        } catch (error) {
          console.error('Google auth backend error:', error);
          return false; // Reject sign-in if there's an issue with the backend
        }
      }
      console.log('Google account data:', account);
      console.log('Google profile data:', profile);      
      return true; // Proceed with sign-in if successful
    },

    async jwt({ token, user, account }) {
      if (user) {
        // On first login, attach user info to the token
        token.userId = user.id;
        token.accessToken = user.token;
        token.name = user.name;
      }
      if (account?.provider === 'google') {
        // Store Google account information in the token
        token.provider = account.provider;
      }
      console.log('JWT account:', account);      
      return token;
    },

    async session({ session, token }) {
      // Attach JWT token info to the session object
      console.log('Session object:', session);      
      session.user.name = token.name ?? '';
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  debug: true, // Enable verbose logging for debugging
  logger: {
    error(code, metadata) {
      console.error('[OAuth Error]', code, JSON.stringify(metadata, null, 2));
    },
    warn(code) {
      console.warn('[OAuth Warning]', code);
    },
    debug(code, metadata) {
      console.log('[OAuth Debug]', code, metadata);
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
