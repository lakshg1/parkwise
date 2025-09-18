'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import ParkingAvailability from '@/components/parking/parking-availability';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-8 w-1/2" />
        </div>
        <div className="mt-8 space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold font-headline">Find Your Spot</h1>
      <p className="text-muted-foreground mt-1">
        Select a vehicle type and see real-time parking availability.
      </p>
      <div className="mt-8">
        <ParkingAvailability />
      </div>
    </div>
  );
}
