'use server';

/**
 * @fileOverview An AI crime prediction flow.
 *
 * - predictCrime - A function that handles the crime prediction process.
 * - PredictCrimeInput - The input type for the predictCrime function.
 * - PredictCrimeOutput - The return type for the predictCrime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCrimeInputSchema = z.object({
  dateRange: z.object({
    startDate: z.string().describe('The start date for the prediction range.'),
    endDate: z.string().describe('The end date for the prediction range.'),
  }).describe('The date range for which to predict crime.'),
  policeStation: z.string().describe('The police station for which to predict crime.'),
  crimeTypes: z.array(z.string()).describe('The types of crime to include in the prediction.'),
});
export type PredictCrimeInput = z.infer<typeof PredictCrimeInputSchema>;

const PredictCrimeOutputSchema = z.object({
  dailyPredictions: z.array(
    z.object({
      date: z.string().describe('The date of the prediction.'),
      crimeCount: z.number().describe('The predicted number of crimes for that date.'),
    })
  ).describe('Predicted crime counts per day for the specified date range.'),
  crimeTypeBreakdown: z.array(
    z.object({
      crimeType: z.string().describe('The type of crime.'),
      count: z.number().describe('The predicted number of crimes of that type.'),
    })
  ).describe('Predicted breakdown of crime types for the specified police station.'),
});
export type PredictCrimeOutput = z.infer<typeof PredictCrimeOutputSchema>;

export async function predictCrime(input: PredictCrimeInput): Promise<PredictCrimeOutput> {
  return predictCrimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCrimePrompt',
  input: {schema: PredictCrimeInputSchema},
  output: {schema: PredictCrimeOutputSchema},
  prompt: `You are an AI assistant that predicts crime rates for different locations. Your predictions should be based on historical trends but should be clearly presented as future estimates.

  Given the following information, predict the crime rates for the next 30 days from the end date.

  Date Range: {{{dateRange.startDate}}} - {{{dateRange.endDate}}}
  Police Station: {{{policeStation}}}
  Crime Types: {{#each crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Generate a list of daily crime count predictions for the 30 days following the provided end date. For each day, provide a date in ISO 8601 format (YYYY-MM-DD) and a predicted crimeCount.
  
  Also, provide a breakdown of the total predicted crimes by crime type for the entire 30-day prediction period.
  
  Your entire output must be a valid JSON object matching the requested output schema. Ensure all fields are populated with realistic, non-random data.`,
});

const predictCrimeFlow = ai.defineFlow(
  {
    name: 'predictCrimeFlow',
    inputSchema: PredictCrimeInputSchema,
    outputSchema: PredictCrimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
