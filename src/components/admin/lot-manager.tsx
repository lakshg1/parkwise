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
import { PlusCircle, Car, Bike } from 'lucide-react';

const lotFormSchema = z.object({
  name: z.string().min(3, 'Lot name must be at least 3 characters.'),
  location: z.string().min(5, 'Location must be at least 5 characters.'),
  totalCarSlots: z.coerce.number().min(0, 'Cannot be negative.'),
  totalBikeSlots: z.coerce.number().min(0, 'Cannot be negative.'),
});

export default function LotManager() {
  const { lots, addLot } = useParkingStore();
  const { toast } = useToast();

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
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Lots</CardTitle>
            <CardDescription>A list of all parking lots currently in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">
                    <Car className="h-5 w-5 inline-block" />
                  </TableHead>
                  <TableHead className="text-center">
                    <Bike className="h-5 w-5 inline-block" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map(lot => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.name}</TableCell>
                    <TableCell className="text-muted-foreground">{lot.location}</TableCell>
                    <TableCell className="text-center">{lot.totalCarSlots}</TableCell>
                    <TableCell className="text-center">{lot.totalBikeSlots}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
