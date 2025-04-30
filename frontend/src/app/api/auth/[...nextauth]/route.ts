import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // We'll move authOptions to a shared place

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
