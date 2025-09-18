export type VehicleType = 'car' | 'bike';
export type UserRole = 'user' | 'admin';

export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  totalCarSlots: number;
  totalBikeSlots: number;
}

export interface ParkingSlot {
  id: string;
  lotId: string;
  slotType: VehicleType;
  slotNumber: string;
  isAvailable: boolean;
  bikeCapacity?: number; // For car slots that can hold bikes
  bikesParked?: string[]; // To track which bikes (by vehicleNumber) are in a car slot
}

export interface Booking {
  id: string;
  userName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  slotId: string;
  lotId: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'expired' | 'cancelled';
  price?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface PricingRule {
  id: string;
  lotId: string;
  vehicleType: VehicleType;
  peakStartTime: string; // HH:mm format
  peakEndTime: string; // HH:mm format
  peakPrice: number; // price per hour
  offPeakPrice: number; // price per hour
}
