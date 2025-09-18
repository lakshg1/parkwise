'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating parking reports.
 *
 * - generateParkingReports - A function that generates occupancy and revenue reports for a specific parking lot and date range.
 * - GenerateParkingReportsInput - The input type for the generateParkingReports function.
 * - GenerateParkingReportsOutput - The return type for the generateParkingReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateParkingReportsInputSchema = z.object({
  lotId: z.string().describe('The ID of the parking lot for which to generate the report.'),
  dateRangeStart: z.string().describe('The start date for the report (YYYY-MM-DD).'),
  dateRangeEnd: z.string().describe('The end date for the report (YYYY-MM-DD).'),
});
export type GenerateParkingReportsInput = z.infer<
  typeof GenerateParkingReportsInputSchema
>;

const GenerateParkingReportsOutputSchema = z.object({
  report: z.string().describe('The generated parking report in CSV format.'),
  analysis: z
    .string()
    .describe(
      'An analysis of the parking data, including suggestions for improvements.'
    ),
});
export type GenerateParkingReportsOutput = z.infer<
  typeof GenerateParkingReportsOutputSchema
>;

export async function generateParkingReports(
  input: GenerateParkingReportsInput
): Promise<GenerateParkingReportsOutput> {
  return generateParkingReportsFlow(input);
}

const analyzeParkingData = ai.defineTool(
  {
    name: 'analyzeParkingData',
    description:
      'Analyzes parking data and provides suggestions for improvements.',
    inputSchema: z.object({
      report: z
        .string()
        .describe(
          'The parking report data, including occupancy and revenue, in CSV format.'
        ),
    }),
    outputSchema: z
      .string()
      .describe('Suggestions for improvements based on the data.'),
  },
  async input => {
    const {output} = await ai.generate({
      prompt: `Analyze the following CSV parking data and provide suggestions for improvements. Focus on trends in occupancy and revenue.

        CSV Data:
        ${input.report}
      `,
    });
    return output!;
  }
);

const generateReportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateParkingReportsInputSchema},
  output: {
    schema: z.object({
      csv: z.string().describe('The report in CSV format.'),
    }),
  },
  prompt: `You are an AI assistant tasked with generating parking reports.

  Generate a report summarizing the occupancy and revenue for parking lot {{lotId}} between {{dateRangeStart}} and {{dateRangeEnd}}.
  The report must be in CSV format.

  The report should include the following columns:
  - Date (YYYY-MM-DD)
  - Total Bookings
  - Total Revenue
  - Average Occupancy

  Example report:
  Date,Total Bookings,Total Revenue,Average Occupancy
  2024-01-01,10,100,0.5
  2024-01-02,15,150,0.75`,
});

const generateParkingReportsFlow = ai.defineFlow(
  {
    name: 'generateParkingReportsFlow',
    inputSchema: GenerateParkingReportsInputSchema,
    outputSchema: GenerateParkingReportsOutputSchema,
  },
  async input => {
    const {output: reportOutput} = await generateReportPrompt(input);
    if (!reportOutput) {
      throw new Error('Failed to generate report');
    }

    const analysis = await analyzeParkingData({report: reportOutput.csv});

    return {
      report: reportOutput.csv,
      analysis: analysis,
    };
  }
);
