// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User {
    id: number;
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: number;
    accessToken?: string;
  }
}
