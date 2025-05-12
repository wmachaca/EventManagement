// auth.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios, { AxiosError } from 'axios';

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.accessToken = user.token;
        token.name = user.name;
      }
if (account?.provider === 'google') {
  token.accessToken = account.access_token;
  token.id = account.providerAccountId;
  token.provider = 'google';
}
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId || token.id || '';
      session.user.name = token.name ?? '';
      session.accessToken = token.accessToken ?? '';
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
