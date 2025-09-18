
'use client';

import { useParkingStore } from '@/hooks/use-parking-store';
import type { ParkingLot, ParkingSlot, VehicleType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Car, Bike } from 'lucide-react';

export default function SlotGrid({
  lot,
  vehicleType,
  onSlotClick,
}: {
  lot: ParkingLot;
  vehicleType: VehicleType;
  onSlotClick: (slot: ParkingSlot) => void;
}) {
  const { getSlotsByLot } = useParkingStore();
  const slots = getSlotsByLot(lot.id);

  const carSlots = slots.filter(s => s.slotType === 'car');
  const bikeSlots = slots.filter(s => s.slotType === 'bike');

  const Slot = ({ slot }: { slot: ParkingSlot }) => {
    const isForCar = slot.slotType === 'car';
    const bikeSpacesInCarSlot = (slot.bikeCapacity ?? 2) - (slot.bikesParked?.length ?? 0);
    
    let isBookable = false;
    if (vehicleType === 'car') {
        isBookable = isForCar && slot.isAvailable;
    } else { // bike
        isBookable = (slot.slotType === 'bike' && slot.isAvailable) || (isForCar && slot.isAvailable && bikeSpacesInCarSlot > 0);
    }
    
    return (
        <button
            onClick={() => onSlotClick(slot)}
            disabled={!isBookable}
            className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-md border-2 aspect-square transition-all duration-200",
                isBookable ? "border-primary/50 bg-primary/10 hover:bg-primary/20 hover:border-primary cursor-pointer" : "border-muted bg-muted/50 cursor-not-allowed",
                !slot.isAvailable && "bg-destructive/20 border-destructive/30",
            )}
            title={slot.isAvailable ? `Book ${slot.slotNumber}` : `Slot ${slot.slotNumber} is occupied`}
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
  );
}
