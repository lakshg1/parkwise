'use client';

import { useParkingStore } from '@/hooks/use-parking-store';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, Car, Bike, User, Tag, Calendar, Clock, ParkingSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

export default function BookingDetails({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const { getBooking, cancelBooking, getLot, getSlotsByLot } = useParkingStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const booking = getBooking(bookingId);

  if (!user) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!booking) {
    return (
      <Alert variant="destructive">
        <Ticket className="h-4 w-4" />
        <AlertTitle>Booking Not Found</AlertTitle>
        <AlertDescription>
          The booking with ID "{bookingId}" could not be found. It may have been cancelled or never existed.
        </AlertDescription>
      </Alert>
    );
  }

  const lot = getLot(booking.lotId);
  const slot = getSlotsByLot(booking.lotId).find(s => s.id === booking.slotId);

  const handleCancel = () => {
    cancelBooking(booking.id);
    toast({
      title: 'Booking Cancelled',
      description: `Your booking for vehicle ${booking.vehicleNumber} has been successfully cancelled.`,
    });
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl font-headline">Booking Confirmation</CardTitle>
                <CardDescription>Your parking is confirmed. Details below.</CardDescription>
            </div>
            <Ticket className="h-10 w-10 text-primary"/>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-primary text-primary-foreground rounded-lg text-center font-mono text-xl tracking-widest">
            {booking.id}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span><strong>Name:</strong> {booking.userName}</span>
            </div>
            <div className="flex items-center gap-3">
              {booking.vehicleType === 'car' 
                ? <Car className="h-5 w-5 text-muted-foreground" /> 
                : <Bike className="h-5 w-5 text-muted-foreground" />}
              <span><strong>Vehicle No:</strong> {booking.vehicleNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <ParkingSquare className="h-5 w-5 text-muted-foreground" />
              <span><strong>Lot:</strong> {lot?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <span><strong>Slot:</strong> {slot?.slotNumber}</span>
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
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">Thank you for using ParkWise!</p>
            <Button variant="destructive" onClick={handleCancel}>
                Cancel Booking
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
