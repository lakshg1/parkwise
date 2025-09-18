
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import type { ParkingLot, ParkingSlot, VehicleType } from '@/lib/types';
import { useParkingStore } from '@/hooks/use-parking-store';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

const bookingFormSchema = z.object({
  userName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  vehicleNumber: z.string().min(3, { message: 'Vehicle number must be at least 3 characters.' }),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
});

interface PriceDetails {
  peakHours: number;
  offPeakHours: number;
  peakCost: number;
  offPeakCost: number;
  totalCost: number;
}

export function BookingDialog({
  open,
  onOpenChange,
  slot,
  lot,
  vehicleType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: ParkingSlot;
  lot: ParkingLot;
  vehicleType: VehicleType;
}) {
  const { addBooking, getPricingRule } = useParkingStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [priceDetails, setPriceDetails] = useState<PriceDetails | null>(null);

  const defaultStartTime = new Date();
  const defaultEndTime = new Date(defaultStartTime.getTime() + 2 * 60 * 60 * 1000);

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      userName: user?.name || '',
      vehicleNumber: '',
      startTime: defaultStartTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      endTime: defaultEndTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    },
  });

  const pricingRule = useMemo(() => getPricingRule(lot.id, vehicleType), [getPricingRule, lot.id, vehicleType]);

  const calculatePrice = () => {
    if (!pricingRule) return;

    const { startTime, endTime } = form.getValues();
    if (!startTime || !endTime) return;
    
    const startDate = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (endDate <= startDate) {
      setPriceDetails({ peakHours: 0, offPeakHours: 0, peakCost: 0, offPeakCost: 0, totalCost: 0 });
      return;
    }

    let peakMinutes = 0;
    let offPeakMinutes = 0;
    
    if (pricingRule.peakStartTime && pricingRule.peakEndTime) {
        const peakStart = new Date(startDate);
        const [peakStartHours, peakStartMinutes] = pricingRule.peakStartTime.split(':').map(Number);
        peakStart.setHours(peakStartHours, peakStartMinutes, 0, 0);
        
        const peakEnd = new Date(startDate);
        const [peakEndHours, peakEndMinutes] = pricingRule.peakEndTime.split(':').map(Number);
        peakEnd.setHours(peakEndHours, peakEndMinutes, 0, 0);

        let currentMinute = new Date(startDate);
        while(currentMinute < endDate) {
            const isPeak = currentMinute >= peakStart && currentMinute < peakEnd;
            if (isPeak) {
                peakMinutes++;
            } else {
                offPeakMinutes++;
            }
            currentMinute.setMinutes(currentMinute.getMinutes() + 1);
        }
    } else {
        offPeakMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    }
    
    const peakHours = peakMinutes / 60;
    const offPeakHours = offPeakMinutes / 60;
    const peakCost = peakHours * pricingRule.peakPrice;
    const offPeakCost = offPeakHours * pricingRule.offPeakPrice;
    const totalCost = peakCost + offPeakCost;

    setPriceDetails({ peakHours, offPeakHours, peakCost, offPeakCost, totalCost });
  };

  useEffect(() => {
    calculatePrice(); // Initial calculation
    const subscription = form.watch(() => calculatePrice());
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingRule]);

  const onSubmit = (values: z.infer<typeof bookingFormSchema>) => {
    const { startTime, endTime } = values;
    
    const startDate = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    const newBooking = addBooking({
      userName: values.userName,
      vehicleNumber: values.vehicleNumber,
      vehicleType,
      slotId: slot.id,
      lotId: lot.id,
      startTime: startDate,
      endTime: endDate,
      price: priceDetails?.totalCost || 0,
    });
    onOpenChange(false);
    toast({
      title: 'Booking Successful!',
      description: `Slot ${slot.slotNumber} booked for vehicle ${values.vehicleNumber}.`,
    });
    router.push(`/booking/${newBooking.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Slot {slot.slotNumber}</DialogTitle>
          <DialogDescription>
            You are booking a {vehicleType} spot at {lot.name}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input placeholder="STATE-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            {pricingRule && priceDetails && (
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Estimated Price
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {priceDetails.peakHours > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Peak ({priceDetails.peakHours.toFixed(2)} hrs &times; ${pricingRule.peakPrice}/hr)</span>
                                <span>${priceDetails.peakCost.toFixed(2)}</span>
                            </div>
                        )}
                        {priceDetails.offPeakHours > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Off-Peak ({priceDetails.offPeakHours.toFixed(2)} hrs &times; ${pricingRule.offPeakPrice}/hr)</span>
                                <span>${priceDetails.offPeakCost.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-dashed my-2" />
                        <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>${priceDetails.totalCost.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button type="submit" className="w-full" disabled={!priceDetails}>
                Confirm Booking
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
