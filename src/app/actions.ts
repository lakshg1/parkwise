'use server';

import { generateParkingReports } from '@/ai/flows/generate-parking-reports';
import type { GenerateParkingReportsInput } from '@/ai/flows/generate-parking-reports';

export async function generateReportAction(input: GenerateParkingReportsInput) {
  try {
    const result = await generateParkingReports(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false, error: 'Failed to generate report.' };
  }
}
