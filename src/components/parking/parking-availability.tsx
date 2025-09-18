'use client';

import { useState, useMemo } from 'react';
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

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      userName: user?.name || '',
      vehicleNumber: '',
    },
  });

  const onSubmit = (values: z.infer<typeof bookingFormSchema>) => {
    const newBooking = addBooking({
      ...values,
      vehicleType,
      slotId: slot.id,
      lotId: lot.id,
    });
    onOpenChange(false);
    toast({
      title: 'Booking Successful!',
      description: `Slot ${slot.slotNumber} booked for vehicle ${values.vehicleNumber}.`,
    });
    router.push(`/booking/${newBooking.id}`);
  };

  const pricingRule = getPricingRule(lot.id, vehicleType);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Slot {slot.slotNumber}</DialogTitle>
          <DialogDescription>
            You are booking a {vehicleType} spot at {lot.name}.
          </DialogDescription>
        </DialogHeader>
        {pricingRule && (
          <div className="text-sm text-muted-foreground">
            Current rate: ${pricingRule.peakPrice}/hour (peak), ${pricingRule.offPeakPrice}/hour (off-peak).
          </div>
        )}
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
