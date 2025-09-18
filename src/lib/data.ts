import type { ParkingLot, ParkingSlot, PricingRule, User } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: '2', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

export const mockParkingLots: ParkingLot[] = [
  { id: 'lot1', name: 'Downtown Central Garage', location: '123 Main St, Anytown', totalCarSlots: 20, totalBikeSlots: 10 },
  { id: 'lot2', name: 'Uptown Plaza Lot', location: '456 Oak Ave, Anytown', totalCarSlots: 15, totalBikeSlots: 20 },
];

export const mockParkingSlots: ParkingSlot[] = [
  // Lot 1 Slots
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `lot1-car-${i + 1}`,
    lotId: 'lot1',
    slotType: 'car' as const,
    slotNumber: `C${i + 1}`,
    isAvailable: true,
    bikeCapacity: 2,
    bikesParked: [],
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `lot1-bike-${i + 1}`,
    lotId: 'lot1',
    slotType: 'bike' as const,
    slotNumber: `B${i + 1}`,
    isAvailable: true,
  })),
  // Lot 2 Slots
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `lot2-car-${i + 1}`,
    lotId: 'lot2',
    slotType: 'car' as const,
    slotNumber: `C${i + 1}`,
    isAvailable: true,
    bikeCapacity: 2,
    bikesParked: [],
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `lot2-bike-${i + 1}`,
    lotId: 'lot2',
    slotType: 'bike' as const,
    slotNumber: `B${i + 1}`,
    isAvailable: true,
  })),
];

// Pre-book some slots for demonstration
mockParkingSlots[2].isAvailable = false; // Lot 1, C3
mockParkingSlots[5].isAvailable = false; // Lot 1, C6
mockParkingSlots[21].isAvailable = false; // Lot 1, B2
mockParkingSlots[32].isAvailable = false; // Lot 2, C3

export const mockPricingRules: PricingRule[] = [
    {
        id: 'rule1',
        lotId: 'lot1',
        vehicleType: 'car',
        peakStartTime: '09:00',
        peakEndTime: '18:00',
        peakPrice: 5,
        offPeakPrice: 3
    },
    {
        id: 'rule2',
        lotId: 'lot1',
        vehicleType: 'bike',
        peakStartTime: '09:00',
        peakEndTime: '18:00',
        peakPrice: 2,
        offPeakPrice: 1
    },
    {
        id: 'rule3',
        lotId: 'lot2',
        vehicleType: 'car',
        peakStartTime: '08:00',
        peakEndTime: '17:00',
        peakPrice: 6,
        offPeakPrice: 4
    },
    {
        id: 'rule4',
        lotId: 'lot2',
        vehicleType: 'bike',
        peakStartTime: '08:00',
        peakEndTime: '17:00',
        peakPrice: 2.5,
        offPeakPrice: 1.5
    }
];

// Add some initial bookings
export const mockBookings = [
    {
        id: 'BOOK-123',
        userName: 'Test User',
        vehicleNumber: 'TEST-123',
        vehicleType: 'car' as const,
        slotId: 'lot1-car-3',
        lotId: 'lot1',
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        status: 'confirmed' as const,
        price: 10
    }
]
