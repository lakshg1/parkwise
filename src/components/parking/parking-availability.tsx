
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
import { Car, Bike } from 'lucide-react';
import type { ParkingSlot, VehicleType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BookingDialog } from './booking-dialog';
import SlotGrid from './slot-grid';

export default function ParkingAvailability() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const { lots, getSlotsByLot } = useParkingStore();

  const selectedLot = useMemo(() => {
    if (!selectedSlot) return null;
    return lots.find(lot => lot.id === selectedSlot.lotId) || null;
  }, [selectedSlot, lots]);
  
  const [expandedLot, setExpandedLot] = useState<string | null>(null);

  const handleSlotClick = (slot: ParkingSlot) => {
    if (vehicleType === 'car') {
      if (slot.slotType === 'car' && slot.isAvailable) {
        setSelectedSlot(slot);
      }
    } else { // vehicleType is 'bike'
      if (
        (slot.slotType === 'bike' && slot.isAvailable) ||
        (slot.slotType === 'car' && slot.isAvailable && ((slot.bikeCapacity ?? 2) - (slot.bikesParked?.length ?? 0) > 0))
      ) {
        setSelectedSlot(slot);
      }
    }
  };
  
  const toggleLotExpansion = (lotId: string) => {
    setExpandedLot(prev => (prev === lotId ? null : lotId));
  }

  const lotsWithAvailability = useMemo(() => {
    return lots.map(lot => {
      const slots = getSlotsByLot(lot.id);
      const carSlots = slots.filter(s => s.slotType === 'car');
      const availableCarSlots = carSlots.filter(s => s.isAvailable).length;
      
      const availableBikeSlots = slots.filter(s => s.slotType === 'bike' && s.isAvailable).length;
      
      const availableBikeSpacesInCarSlots = carSlots
        .filter(s => s.isAvailable)
        .reduce((acc, s) => acc + (s.bikeCapacity ?? 2) - (s.bikesParked?.length ?? 0), 0);
      
      return {
        ...lot,
        availableCarSlots,
        availableBikeSlots: availableBikeSlots + availableBikeSpacesInCarSlots,
        totalBikeCapacity: lot.totalBikeSlots + carSlots.reduce((acc, s) => acc + (s.bikeCapacity ?? 2), 0)
      };
    });
  }, [lots, getSlotsByLot]);

  return (
    <div className="space-y-8">
      {selectedLot && selectedSlot && (
        <BookingDialog
          open={!!selectedSlot}
          onOpenChange={() => setSelectedSlot(null)}
          slot={selectedSlot}
          lot={selectedLot}
          vehicleType={vehicleType}
        />
      )}
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
            className={cn(
              "cursor-pointer hover:border-primary transition-colors",
              expandedLot === lot.id && "border-primary"
            )}
            onClick={() => toggleLotExpansion(lot.id)}
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
                      {vehicleType === 'car'
                        ? <span>{lot.availableBikeSlots} spots for bikes</span>
                        : <span>{lot.availableBikeSlots} available</span>
                      }
                    </div>
                  </div>
              </div>
            </CardHeader>
            {expandedLot === lot.id && (
              <CardContent>
                <SlotGrid 
                  lot={lot} 
                  vehicleType={vehicleType} 
                  onSlotClick={handleSlotClick} 
                />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
