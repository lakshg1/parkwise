'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state is loaded and user is not an admin, redirect
    if (user !== undefined && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user === undefined) {
    // Loading state
    return (
        <div className="container py-8 px-4 md:px-6">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (user?.role !== 'admin') {
    // This will be shown briefly before redirection
    return (
        <div className="container py-8 px-4 md:px-6">
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to view this page. Redirecting...
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return <>{children}</>;
}
