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
import { crimeData } from '@/lib/mock-data';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

const PredictCrimeInputSchema = z.object({
  dateRange: z.object({
    startDate: z.string().describe('The start date for the prediction range (ISO 8601 format).'),
    endDate: z.string().describe('The end date for the prediction range (ISO 8601 format).'),
  }).describe('The date range for which to predict crime.'),
  policeStation: z.string().describe('The police station for which to predict crime.'),
  crimeTypes: z.array(z.string()).describe('The types of crime to include in the prediction.'),
});
export type PredictCrimeInput = z.infer<typeof PredictCrimeInputSchema>;

const DailyPredictionSchema = z.object({
  date: z.string().describe('The date of the data point (YYYY-MM-DD).'),
  historicalCount: z.number().optional().describe('The actual number of crimes for that date. This will be null for future dates.'),
  predictedCount: z.number().optional().describe('The predicted number of crimes for that date. This will be null for past dates.'),
});

const PredictCrimeOutputSchema = z.object({
  dailyData: z.array(DailyPredictionSchema).describe('Historical and predicted crime counts per day for the specified date range.'),
  crimeTypeBreakdown: z.array(
    z.object({
      crimeType: z.string().describe('The type of crime.'),
      count: z.number().describe('The predicted number of crimes of that type for the future portion of the date range.'),
    })
  ).describe('Predicted breakdown of crime types for the future dates in the specified police station.'),
});
export type PredictCrimeOutput = z.infer<typeof PredictCrimeOutputSchema>;


export async function predictCrime(input: PredictCrimeInput): Promise<PredictCrimeOutput> {
  return predictCrimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCrimePrompt',
  input: {schema: z.object({
    analysisPrompt: z.string(),
    input: PredictCrimeInputSchema,
  })},
  output: {schema: PredictCrimeOutputSchema},
  prompt: `You are an AI assistant that analyzes historical crime data and predicts future crime rates.

  Historical Data Analysis:
  {{analysisPrompt}}
  
  Based on the historical data and trends, provide a future crime prediction.
  
  User's Request:
  - Date Range for Prediction: {{{input.dateRange.startDate}}} to {{{input.dateRange.endDate}}}
  - Police Station: {{{input.policeStation}}}
  - Crime Types: {{#each input.crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  
  Instructions:
  1.  Generate a list of daily data points ('dailyData') for the entire requested date range.
  2.  For past dates, populate the 'historicalCount' from the provided analysis and leave 'predictedCount' as null.
  3.  For all future dates (today and onwards), generate a realistic 'predictedCount' based on the historical trends and leave 'historicalCount' as null.
  4.  Provide a 'crimeTypeBreakdown' of the total *predicted* crimes for the future period.
  
  Your entire output must be a valid JSON object matching the requested output schema. Ensure all fields are populated with realistic, non-random data.`,
});

function getHistoricalData(input: PredictCrimeInput) {
  const { startDate, endDate } = input.dateRange;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  let filteredData = crimeData.filter(crime => {
    const crimeDate = parseISO(crime.date);
    const isDateInRange = crimeDate >= start && crimeDate <= end;
    const isStationMatch = input.policeStation === 'all' || crime.policeStation === input.policeStation;
    const isCrimeTypeMatch = input.crimeTypes.includes(crime.crimeType);
    return isDateInRange && isStationMatch && isCrimeTypeMatch;
  });

  const dailyCounts = new Map<string, number>();
  const interval = eachDayOfInterval({ start, end });

  interval.forEach(day => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    dailyCounts.set(formattedDate, 0);
  });

  filteredData.forEach(crime => {
    const crimeDate = format(parseISO(crime.date), 'yyyy-MM-dd');
    if (dailyCounts.has(crimeDate)) {
      dailyCounts.set(crimeDate, dailyCounts.get(crimeDate)! + 1);
    }
  });

  return Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count }));
}


const predictCrimeFlow = ai.defineFlow(
  {
    name: 'predictCrimeFlow',
    inputSchema: PredictCrimeInputSchema,
    outputSchema: PredictCrimeOutputSchema,
  },
  async (input) => {
    const historical = getHistoricalData(input);
    const today = format(new Date(), 'yyyy-MM-dd');

    const pastData = historical.filter(d => d.date < today);

    const analysisPrompt = `
      Here is the historical crime data for the requested filters. Use this to identify trends (daily, weekly, seasonal) and inform your prediction.
      [
        ${pastData.map(d => `{ "date": "${d.date}", "crime_count": ${d.count} }`).join(',\n')}
      ]
    `;

    const { output } = await prompt({ analysisPrompt, input });
    
    // Combine historical and predicted data
    if (output) {
      const combinedDailyData = historical.map(h => {
        const prediction = output.dailyData.find(p => p.date === h.date);
        if (h.date < today) {
          return { date: h.date, historicalCount: h.count, predictedCount: null };
        } else {
          return { date: h.date, historicalCount: null, predictedCount: prediction?.predictedCount ?? 0 };
        }
      });
       // Ensure the output matches the schema, especially for dates outside the historical range.
       const allDates = new Set(historical.map(h => h.date));
       output.dailyData.forEach(p => {
         if (!allDates.has(p.date)) {
           combinedDailyData.push({
             date: p.date,
             historicalCount: null,
             predictedCount: p.predictedCount
           });
         }
       });

       combinedDailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


      return {
        dailyData: combinedDailyData,
        crimeTypeBreakdown: output.crimeTypeBreakdown
      };
    }

    return {
      dailyData: historical.map(h => ({ date: h.date, historicalCount: h.count, predictedCount: null })),
      crimeTypeBreakdown: []
    };
  }
);
