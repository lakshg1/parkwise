'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  mockParkingLots,
  mockParkingSlots,
  mockPricingRules,
  mockBookings
} from '@/lib/data';
import type {
  ParkingLot,
  ParkingSlot,
  PricingRule,
  Booking,
  VehicleType,
} from '@/lib/types';

interface ParkingState {
  lots: ParkingLot[];
  slots: ParkingSlot[];
  pricingRules: PricingRule[];
  bookings: Booking[];
  getLot: (lotId: string) => ParkingLot | undefined;
  getSlotsByLot: (lotId: string) => ParkingSlot[];
  getBooking: (bookingId: string) => Booking | undefined;
  getPricingRule: (lotId: string, vehicleType: VehicleType) => PricingRule | undefined;
  addBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'startTime' | 'endTime'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  updatePricingRule: (updatedRule: PricingRule) => void;
}

const ParkingContext = createContext<ParkingState | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<ParkingLot[]>(mockParkingLots);
  const [slots, setSlots] = useState<ParkingSlot[]>(mockParkingSlots);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(mockPricingRules);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  
  const getLot = useCallback((lotId: string) => lots.find(l => l.id === lotId), [lots]);
  
  const getSlotsByLot = useCallback((lotId: string) => slots.filter(s => s.lotId === lotId), [slots]);

  const getBooking = useCallback((bookingId: string) => bookings.find(b => b.id === bookingId), [bookings]);

  const getPricingRule = useCallback((lotId: string, vehicleType: VehicleType) => {
    return pricingRules.find(r => r.lotId === lotId && r.vehicleType === vehicleType);
  }, [pricingRules]);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'startTime' | 'endTime'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `BOOK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'confirmed',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours booking
    };
    
    setSlots(prevSlots => {
        return prevSlots.map(slot => {
            if (slot.id === newBooking.slotId) {
                if (newBooking.vehicleType === 'car') {
                    return { ...slot, isAvailable: false };
                }
                // Handle bike booking
                if (slot.slotType === 'bike') {
                    return { ...slot, isAvailable: false };
                }
                if (slot.slotType === 'car') {
                    const newBikesParked = [...(slot.bikesParked || []), newBooking.vehicleNumber];
                    const isNowFull = newBikesParked.length >= (slot.bikeCapacity || 2);
                    return { ...slot, isAvailable: !isNowFull, bikesParked: newBikesParked };
                }
            }
            return slot;
        });
    });

    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setSlots(prevSlots => {
        return prevSlots.map(slot => {
            if (slot.id === booking.slotId) {
                if (booking.vehicleType === 'car') {
                    return { ...slot, isAvailable: true };
                }
                // Handle bike cancellation
                if (slot.slotType === 'bike') {
                    return { ...slot, isAvailable: true };
                }
                if (slot.slotType === 'car') {
                    const newBikesParked = (slot.bikesParked || []).filter(bikeNum => bikeNum !== booking.vehicleNumber);
                    return { ...slot, isAvailable: true, bikesParked: newBikesParked };
                }
            }
            return slot;
        });
    });

    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const updatePricingRule = (updatedRule: PricingRule) => {
    setPricingRules(prevRules => {
      const index = prevRules.findIndex(r => r.id === updatedRule.id);
      if (index !== -1) {
        const newRules = [...prevRules];
        newRules[index] = updatedRule;
        return newRules;
      }
      return [...prevRules, { ...updatedRule, id: `rule-${Date.now()}` }];
    });
  };

  const value = {
    lots,
    slots,
    pricingRules,
    bookings,
    getLot,
    getSlotsByLot,
    getBooking,
    getPricingRule,
    addBooking,
    cancelBooking,
    updatePricingRule,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParkingStore() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParkingStore must be used within a ParkingProvider');
  }
  return context;
}
