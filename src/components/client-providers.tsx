'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { ParkingProvider } from '@/hooks/use-parking-store';
import React from 'react';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ParkingProvider>{children}</ParkingProvider>
    </AuthProvider>
  );
}
