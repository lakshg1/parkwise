'use client';

import { useParkingStore } from '@/hooks/use-parking-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { PricingRule } from '@/lib/types';
import { Car, Bike, Save } from 'lucide-react';

export default function PricingManager() {
  const { lots, pricingRules, updatePricingRule } = useParkingStore();
  const [editableRules, setEditableRules] = useState<PricingRule[]>(JSON.parse(JSON.stringify(pricingRules)));
  const { toast } = useToast();

  const getRule = (lotId: string, vehicleType: 'car' | 'bike') => {
    return editableRules.find(r => r.lotId === lotId && r.vehicleType === vehicleType);
  };

  const handleInputChange = (ruleId: string, field: keyof PricingRule, value: string | number) => {
    setEditableRules(prev =>
      prev.map(rule => (rule.id === ruleId ? { ...rule, [field]: value } : rule))
    );
  };
  
  const handleSaveChanges = (ruleId: string) => {
    const ruleToSave = editableRules.find(r => r.id === ruleId);
    if(ruleToSave) {
        updatePricingRule(ruleToSave);
        toast({
            title: "Pricing Updated",
            description: `Pricing for ${ruleToSave.lotId} (${ruleToSave.vehicleType}) has been saved.`,
        });
    }
  };

  const renderRuleRow = (lotId: string, vehicleType: 'car' | 'bike') => {
    const rule = getRule(lotId, vehicleType);
    if (!rule) return null;

    return (
      <TableRow key={rule.id}>
        <TableCell>
            <div className="flex items-center gap-2">
                {vehicleType === 'car' ? <Car className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
                <span className="capitalize">{vehicleType}</span>
            </div>
        </TableCell>
        <TableCell>
          <Input
            type="time"
            value={rule.peakStartTime}
            onChange={e => handleInputChange(rule.id, 'peakStartTime', e.target.value)}
            className="w-32"
          />
        </TableCell>
        <TableCell>
          <Input
            type="time"
            value={rule.peakEndTime}
            onChange={e => handleInputChange(rule.id, 'peakEndTime', e.target.value)}
            className="w-32"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={rule.peakPrice}
            onChange={e => handleInputChange(rule.id, 'peakPrice', parseFloat(e.target.value))}
            className="w-24"
            step="0.1"
            min="0"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={rule.offPeakPrice}
            onChange={e => handleInputChange(rule.id, 'offPeakPrice', parseFloat(e.target.value))}
            className="w-24"
            step="0.1"
            min="0"
          />
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => handleSaveChanges(rule.id)}>
            <Save className="h-5 w-5" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {lots.map(lot => (
        <Card key={lot.id}>
          <CardHeader>
            <CardTitle>{lot.name}</CardTitle>
            <CardDescription>{lot.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Peak Start</TableHead>
                  <TableHead>Peak End</TableHead>
                  <TableHead>Peak Price/hr</TableHead>
                  <TableHead>Off-Peak Price/hr</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderRuleRow(lot.id, 'car')}
                {renderRuleRow(lot.id, 'bike')}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
