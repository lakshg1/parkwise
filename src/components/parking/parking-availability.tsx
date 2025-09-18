
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParkingStore } from '@/hooks/use-parking-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Car, Bike, ParkingSquare } from 'lucide-react';
import type { ParkingLot, ParkingSlot, VehicleType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const bookingFormSchema = z.object({
  userName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  vehicleNumber: z.string().min(3, { message: 'Vehicle number must be at least 3 characters.' }),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
});

function BookingDialog({
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
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
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

  const pricingRule = getPricingRule(lot.id, vehicleType);

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
      setCalculatedPrice(0);
      return;
    };

    let totalCost = 0;
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

    if(!pricingRule.peakStartTime || !pricingRule.peakEndTime) {
      const durationHours = durationMinutes / 60;
      totalCost = durationHours * pricingRule.offPeakPrice;
      setCalculatedPrice(totalCost);
      return;
    }
    
    const peakStart = new Date();
    const [peakStartHours, peakStartMinutes] = pricingRule.peakStartTime.split(':').map(Number);
    peakStart.setHours(peakStartHours, peakStartMinutes, 0, 0);
    
    const peakEnd = new Date();
    const [peakEndHours, peakEndMinutes] = pricingRule.peakEndTime.split(':').map(Number);
    peakEnd.setHours(peakEndHours, peakEndMinutes, 0, 0);

    let currentMinute = new Date(startDate);
    let peakMinutes = 0;
    let offPeakMinutes = 0;

    while(currentMinute < endDate) {
      const isPeak = currentMinute >= peakStart && currentMinute < peakEnd;
      if (isPeak) {
        peakMinutes++;
      } else {
        offPeakMinutes++;
      }
      currentMinute.setMinutes(currentMinute.getMinutes() + 1);
    }
    
    totalCost = (peakMinutes / 60) * pricingRule.peakPrice + (offPeakMinutes / 60) * pricingRule.offPeakPrice;

    setCalculatedPrice(totalCost);
  };

  useEffect(() => {
    const subscription = form.watch(() => calculatePrice());
    calculatePrice(); // Initial calculation
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, pricingRule]);


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
      price: calculatedPrice || 0,
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
             {pricingRule && (
              <div className="text-sm rounded-lg bg-secondary/50 p-3">
                <p><strong>Rates:</strong> ${pricingRule.peakPrice}/hr (peak), ${pricingRule.offPeakPrice}/hr (off-peak)</p>
                {calculatedPrice !== null && (
                  <p className="font-bold text-primary mt-1">
                    <strong>Estimated Price:</strong> ${calculatedPrice.toFixed(2)}
                  </p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full">Confirm Booking</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SlotGrid({ lot, vehicleType }: { lot: ParkingLot; vehicleType: VehicleType }) {
  const { getSlotsByLot } = useParkingStore();
  const slots = getSlotsByLot(lot.id);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const carSlots = slots.filter(s => s.slotType === 'car');
  const bikeSlots = slots.filter(s => s.slotType === 'bike');

  const handleSlotClick = (slot: ParkingSlot) => {
    // Logic to check if slot is bookable for the selected vehicle type
    if (vehicleType === 'car') {
      if (slot.slotType === 'car' && slot.isAvailable) {
        setSelectedSlot(slot);
      }
    } else { // vehicleType is 'bike'
      if ((slot.slotType === 'bike' && slot.isAvailable) || (slot.slotType === 'car' && slot.isAvailable)) {
        setSelectedSlot(slot);
      }
    }
  };

  const Slot = ({ slot }: { slot: ParkingSlot }) => {
    const isForCar = slot.slotType === 'car';
    let isBookable = false;
    let bikeSpacesInCarSlot = 0;
    if (vehicleType === 'car') {
        isBookable = isForCar && slot.isAvailable;
    } else { // bike
        isBookable = (slot.slotType === 'bike' && slot.isAvailable) || (isForCar && slot.isAvailable)
    }

    if (isForCar) {
      bikeSpacesInCarSlot = (slot.bikeCapacity ?? 2) - (slot.bikesParked?.length ?? 0);
    }
    
    return (
        <button
            onClick={() => handleSlotClick(slot)}
            disabled={!isBookable}
            className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-md border-2 aspect-square transition-all duration-200",
                isBookable ? "border-primary/50 bg-primary/10 hover:bg-primary/20 hover:border-primary cursor-pointer" : "border-muted bg-muted/50 cursor-not-allowed",
                !slot.isAvailable && !isBookable && "bg-destructive/20 border-destructive/30",
            )}
        >
            {isForCar && vehicleType === 'bike' && slot.isAvailable && (
                <div className="absolute top-1 right-1 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Bike className="h-3 w-3" /> {bikeSpacesInCarSlot}
                </div>
            )}
            <div className="text-xl font-bold">{isForCar ? <Car className="h-8 w-8"/> : <Bike className="h-8 w-8"/>}</div>
            <span className="text-sm font-medium text-muted-foreground">{slot.slotNumber}</span>
            {!slot.isAvailable && <div className="absolute inset-0 bg-foreground/30 rounded-md" />}
        </button>
    )
  }

  return (
    <>
      {selectedSlot && (
        <BookingDialog
          open={!!selectedSlot}
          onOpenChange={() => setSelectedSlot(null)}
          slot={selectedSlot}
          lot={lot}
          vehicleType={vehicleType}
        />
      )}
      <div>
        <h3 className="text-lg font-semibold mt-6 mb-2">Car Slots</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-4">
          {carSlots.map(slot => <Slot key={slot.id} slot={slot} />)}
        </div>
        <h3 className="text-lg font-semibold mt-6 mb-2">Bike Slots</h3>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 md:gap-4">
          {bikeSlots.map(slot => <Slot key={slot.id} slot={slot} />)}
        </div>
      </div>
    </>
  );
}

export default function ParkingAvailability() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const { lots, getSlotsByLot } = useParkingStore();

  const lotsWithAvailability = useMemo(() => {
    return lots.map(lot => {
      const slots = getSlotsByLot(lot.id);
      const availableCarSlots = slots.filter(s => s.slotType === 'car' && s.isAvailable).length;
      const availableBikeSlots = slots.filter(s => s.slotType === 'bike' && s.isAvailable).length;
      // Car slots can be used for bikes
      const availableBikeSpacesInCarSlots = slots
        .filter(s => s.slotType === 'car' && s.isAvailable)
        .reduce((acc, s) => acc + (s.bikeCapacity ?? 2) - (s.bikesParked?.length ?? 0), 0);
      
      return {
        ...lot,
        availableCarSlots,
        availableBikeSlots: availableBikeSlots + availableBikeSpacesInCarSlots,
      };
    });
  }, [lots, getSlotsByLot]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Type</CardTitle>
          <CardDescription>Are you parking a car or a bike?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue="car"
            className="flex space-x-4"
            onValueChange={(value: VehicleType) => setVehicleType(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="car" id="car" />
              <Label htmlFor="car" className="flex items-center gap-2 text-lg"><Car />Car</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bike" id="bike" />
              <Label htmlFor="bike" className="flex items-center gap-2 text-lg"><Bike />Bike</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {lotsWithAvailability.map(lot => (
          <Card 
            key={lot.id} 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedLot(lot.id === selectedLot?.id ? null : lot)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{lot.name}</CardTitle>
                    <CardDescription>{lot.location}</CardDescription>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="flex items-center justify-end gap-1 font-semibold">
                        <Car className="h-5 w-5 text-muted-foreground" /> 
                        <span>{lot.availableCarSlots} / {lot.totalCarSlots}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 font-semibold">
                        <Bike className="h-5 w-5 text-muted-foreground" /> 
                        <span>{lot.availableBikeSlots} available</span>
                    </div>
                  </div>
              </div>
            </CardHeader>
            {selectedLot?.id === lot.id && (
              <CardContent>
                <SlotGrid lot={selectedLot} vehicleType={vehicleType} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

    