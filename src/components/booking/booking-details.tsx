'use client';

import { useParkingStore } from '@/hooks/use-parking-store';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, Car, Bike, User, Tag, Calendar, Clock, ParkingSquare, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

export default function BookingDetails({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const { getBooking, cancelBooking, getLot, getSlotsByLot, getPricingRule } = useParkingStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const booking = getBooking(bookingId);
  const lot = booking ? getLot(booking.lotId) : undefined;
  const slot = booking ? getSlotsByLot(booking.lotId).find(s => s.id === booking.slotId) : undefined;
  const pricingRule = booking ? getPricingRule(booking.lotId, booking.vehicleType) : undefined;

  const priceDetails = useMemo(() => {
    if (!booking || !pricingRule) return null;

    const { startTime, endTime } = booking;
    if (endTime <= startTime) return { peakMinutes: 0, offPeakMinutes: 0 };
    
    if(!pricingRule.peakStartTime || !pricingRule.peakEndTime) {
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        return { peakMinutes: 0, offPeakMinutes: durationMinutes };
    }

    const peakStart = new Date(startTime);
    const [peakStartHours, peakStartMinutes] = pricingRule.peakStartTime.split(':').map(Number);
    peakStart.setHours(peakStartHours, peakStartMinutes, 0, 0);

    const peakEnd = new Date(startTime);
    const [peakEndHours, peakEndMinutes] = pricingRule.peakEndTime.split(':').map(Number);
    peakEnd.setHours(peakEndHours, peakEndMinutes, 0, 0);

    let currentMinute = new Date(startTime);
    let peakMinutes = 0;
    let offPeakMinutes = 0;

    while (currentMinute < endTime) {
      const isPeak = currentMinute >= peakStart && currentMinute < peakEnd;
      if (isPeak) {
        peakMinutes++;
      } else {
        offPeakMinutes++;
      }
      currentMinute.setMinutes(currentMinute.getMinutes() + 1);
    }
    
    return { peakMinutes, offPeakMinutes };
  }, [booking, pricingRule]);


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

  const handleCancel = () => {
    cancelBooking(booking.id);
    toast({
      title: 'Booking Cancelled',
      description: `Your booking for vehicle ${booking.vehicleNumber} has been successfully cancelled.`,
    });
    router.push('/dashboard');
  };
  
  const peakHours = priceDetails ? priceDetails.peakMinutes / 60 : 0;
  const offPeakHours = priceDetails ? priceDetails.offPeakMinutes / 60 : 0;
  const peakCost = pricingRule ? peakHours * pricingRule.peakPrice : 0;
  const offPeakCost = pricingRule ? offPeakHours * pricingRule.offPeakPrice : 0;


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
          
           {pricingRule && priceDetails && (
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Price Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {peakHours > 0 && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Peak Hours ({peakHours.toFixed(2)} hrs &times; ${pricingRule.peakPrice}/hr)</span>
                            <span>${peakCost.toFixed(2)}</span>
                        </div>
                    )}
                    {offPeakHours > 0 && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Off-Peak Hours ({offPeakHours.toFixed(2)} hrs &times; ${pricingRule.offPeakPrice}/hr)</span>
                            <span>${offPeakCost.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="border-t border-dashed my-2" />
                    <div className="flex justify-between font-bold text-base">
                        <span>Total Price</span>
                        <span>${(booking.price ?? 0).toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
           )}

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
