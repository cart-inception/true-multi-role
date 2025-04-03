import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${title} | Multi-RoleAI`}</title>
      </Head>
      
      <div className="flex h-screen bg-background">
        <Sidebar user={session?.user || {}} />
        
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <header className="h-16 border-b flex items-center px-6">
            <h1 className="text-xl font-semibold">{title}</h1>
          </header>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
