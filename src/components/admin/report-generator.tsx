'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParkingStore } from '@/hooks/use-parking-store';
import { generateReportAction } from '@/app/actions';
import { Loader2, Download, Lightbulb } from 'lucide-react';
import type { GenerateParkingReportsOutput } from '@/ai/flows/generate-parking-reports';

const formSchema = z.object({
  lotId: z.string().min(1, 'Please select a parking lot.'),
  dateRangeStart: z.string().min(1, 'Please select a start date.'),
  dateRangeEnd: z.string().min(1, 'Please select an end date.'),
});

export default function ReportGenerator() {
  const { lots } = useParkingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<GenerateParkingReportsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lotId: '',
      dateRangeStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateRangeEnd: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setReportData(null);

    const result = await generateReportAction(values);

    if (result.success) {
      setReportData(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  const downloadCSV = () => {
    if (reportData?.report) {
      const blob = new Blob([reportData.report], { type: 'text/csv;charset=utf-s-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `parking_report_${form.getValues('lotId')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Select the lot and date range for the report.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="lotId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parking Lot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRangeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRangeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && <p className="text-destructive">{error}</p>}

      {reportData && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Suggestions for improvements based on the generated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start space-x-4 p-4 bg-secondary/50 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <p className="text-sm text-foreground whitespace-pre-wrap">{reportData.analysis}</p>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Report</CardTitle>
                <CardDescription>
                  Occupancy and revenue data in CSV format.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={downloadCSV}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{reportData.report}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
