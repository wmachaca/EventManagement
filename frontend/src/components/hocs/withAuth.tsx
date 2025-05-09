// components/hocs/withAuth.tsx
import { getSession, useSession } from 'next-auth/react';
import { NextPageContext } from 'next';
import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/login');
      }
    }, [status, router]);

    if (status === 'loading') return <div>Loading...</div>;

    return <WrappedComponent {...props} />;
  };

  Wrapper.getInitialProps = async (ctx: NextPageContext) => {
    const session = await getSession(ctx);

    if (!session && ctx.res) {
      ctx.res.writeHead(302, { Location: '/login' });
      ctx.res.end();
    }

    return { session };
  };

  return Wrapper;
};
