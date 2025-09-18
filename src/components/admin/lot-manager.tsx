'use client';

import { useParkingStore } from '@/hooks/use-parking-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Car, Bike, HardHat, ChevronDown, ChevronRight, Ban } from 'lucide-react';
import { useState } from 'react';
import type { ParkingSlot } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

const lotFormSchema = z.object({
  name: z.string().min(3, 'Lot name must be at least 3 characters.'),
  location: z.string().min(5, 'Location must be at least 5 characters.'),
  totalCarSlots: z.coerce.number().min(0, 'Cannot be negative.'),
  totalBikeSlots: z.coerce.number().min(0, 'Cannot be negative.'),
});

const LotSlotsManager = ({ lotId }: { lotId: string }) => {
    const { getSlotsByLot, setSlotStatus } = useParkingStore();
    const slots = getSlotsByLot(lotId);
  
    const handleStatusChange = (slotId: string, newStatus: boolean) => {
        setSlotStatus(slotId, newStatus ? 'available' : 'maintenance');
    };
    
    return (
        <div className="space-y-4 pt-4">
            <h4 className="font-semibold text-lg">Manage Slots</h4>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Maintenance Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map(slot => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.slotNumber}</TableCell>
                    <TableCell>
                        {slot.slotType === 'car' ? 
                            <Car className="h-5 w-5 text-muted-foreground" /> : 
                            <Bike className="h-5 w-5 text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                         <Badge 
                            variant={
                                slot.status === 'available' ? 'default' :
                                slot.status === 'occupied' ? 'secondary' :
                                'destructive'
                            }
                            className={cn(
                                'capitalize',
                                slot.status === 'available' && 'bg-green-500/80'
                            )}
                         >
                            {slot.status}
                         </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Label htmlFor={`maintenance-switch-${slot.id}`}>
                                {slot.status === 'maintenance' ? 'On' : 'Off'}
                            </Label>
                            <Switch
                                id={`maintenance-switch-${slot.id}`}
                                checked={slot.status === 'maintenance'}
                                onCheckedChange={(checked) => handleStatusChange(slot.id, !checked)}
                                disabled={slot.status === 'occupied'}
                            />
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
    )
}

export default function LotManager() {
  const { lots, addLot } = useParkingStore();
  const { toast } = useToast();
  const [openLotId, setOpenLotId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof lotFormSchema>>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      name: '',
      location: '',
      totalCarSlots: 10,
      totalBikeSlots: 20,
    },
  });

  function onSubmit(values: z.infer<typeof lotFormSchema>) {
    addLot(values);
    toast({
      title: 'Parking Lot Added',
      description: `"${values.name}" has been successfully added to the system.`,
    });
    form.reset();
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-4">
         <Card>
          <CardHeader>
            <CardTitle>Existing Lots</CardTitle>
            <CardDescription>A list of all parking lots currently in the system. Click to manage slots.</CardDescription>
          </CardHeader>
          <CardContent>
            {lots.map(lot => (
                <Collapsible key={lot.id} open={openLotId === lot.id} onOpenChange={() => setOpenLotId(prev => prev === lot.id ? null : lot.id)}>
                    <CollapsibleTrigger asChild>
                       <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div>
                                <p className="font-medium">{lot.name}</p>
                                <p className="text-sm text-muted-foreground">{lot.location}</p>
                            </div>
                             <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Car className="h-5 w-5"/> {lot.totalCarSlots}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bike className="h-5 w-5"/> {lot.totalBikeSlots}
                                </div>
                                {openLotId === lot.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </div>
                       </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                        <LotSlotsManager lotId={lot.id} />
                    </CollapsibleContent>
                </Collapsible>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Add New Lot</CardTitle>
            <CardDescription>Fill out the form to add a new parking lot.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., North Campus Garage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 789 University Ave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalCarSlots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Slots</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalBikeSlots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bike Slots</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Lot
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
