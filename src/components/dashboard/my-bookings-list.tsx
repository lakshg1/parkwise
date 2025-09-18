'use client';

import { useAuth } from '@/hooks/use-auth';
import { useParkingStore } from '@/hooks/use-parking-store';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, Car, Bike, ParkingSquare, Calendar, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export default function MyBookingsList() {
  const { user } = useAuth();
  const { bookings, lots, cancelBooking } = useParkingStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  const userBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter(b => b.userName === user.name).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [user, bookings]);

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    toast({
      title: 'Booking Cancelled',
      description: `Your booking has been successfully cancelled.`,
    });
  };

  if (!user) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (userBookings.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Bookings Found</AlertTitle>
        <AlertDescription>
          You don't have any active bookings. Go to the dashboard to find a parking spot.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {userBookings.map(booking => {
        const lot = lots.find(l => l.id === booking.lotId);
        return (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-headline flex items-center gap-2">
                    {booking.vehicleType === 'car' ? <Car /> : <Bike />}
                    {lot?.name}
                  </CardTitle>
                  <CardDescription>Booking ID: {booking.id}</CardDescription>
                </div>
                 <Button variant="link" onClick={() => router.push(`/booking/${booking.id}`)}>
                    View Details
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                    <ParkingSquare className="h-5 w-5 text-muted-foreground" />
                    <span><strong>Vehicle No:</strong> {booking.vehicleNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span><strong>Date:</strong> {booking.startTime.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>
                        <strong>Time:</strong> {booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {booking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <span><strong>Status:</strong> <span className="capitalize font-medium text-primary">{booking.status}</span></span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="destructive" onClick={() => handleCancel(booking.id)}>
                    Cancel Booking
                </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
