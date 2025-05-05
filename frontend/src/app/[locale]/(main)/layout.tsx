import { ReactNode } from 'react';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            {session?.user && (
              <UserNav user={{
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || undefined
              }} />
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}