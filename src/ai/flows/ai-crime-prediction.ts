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
import { eachDayOfInterval, format, parseISO, isBefore, startOfToday } from 'date-fns';

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
  historicalCount: z.number().nullable().describe('The actual number of crimes for that date. This will be null for future dates.'),
  predictedCount: z.number().nullable().describe('The predicted number of crimes for that date. This will be null for past dates.'),
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
    futureDates: z.array(z.string()),
    input: PredictCrimeInputSchema,
  })},
  output: {schema: PredictCrimeOutputSchema},
  prompt: `You are an AI assistant that analyzes historical crime data and predicts future crime rates.

  Historical Data Analysis:
  I have analyzed the historical data for the requested filters. Here is a summary of daily crime counts:
  {{analysisPrompt}}
  
  Based on this historical data and any underlying trends you can identify (like weekly patterns, or recent increases/decreases), provide a realistic future crime prediction for the upcoming dates.
  
  User's Request:
  - Prediction for Dates: {{#each futureDates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Police Station: {{{input.policeStation}}}
  - Crime Types: {{#each input.crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  
  Instructions:
  1.  Create a 'dailyData' array containing entries ONLY for the future dates listed above.
  2.  For each future date, generate a realistic 'predictedCount'. The 'historicalCount' for these future dates must be null.
  3.  Provide a 'crimeTypeBreakdown' of the total *predicted* crimes for the future period. This breakdown should be based on the user's selected crime types and seem plausible given the historical data.
  
  Your entire output must be a valid JSON object matching the requested output schema. Do not include past dates in your output.`,
});


const predictCrimeFlow = ai.defineFlow(
  {
    name: 'predictCrimeFlow',
    inputSchema: PredictCrimeInputSchema,
    outputSchema: PredictCrimeOutputSchema,
  },
  async (input) => {
    const { startDate, endDate } = input.dateRange;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const today = startOfToday();

    // 1. Get all historical data matching the filters, regardless of date range
    let allFilteredCrime = crimeData.filter(crime => {
        const isStationMatch = input.policeStation === 'all' || crime.policeStation === input.policeStation;
        const isCrimeTypeMatch = input.crimeTypes.includes(crime.crimeType);
        return isStationMatch && isCrimeTypeMatch;
    });

    // 2. Create counts for historical dates within the requested range
    const historicalCounts = new Map<string, number>();
    const allDatesInRange = eachDayOfInterval({ start, end });

    allDatesInRange.forEach(day => {
        if (isBefore(day, today)) {
            const formattedDate = format(day, 'yyyy-MM-dd');
            historicalCounts.set(formattedDate, 0);
        }
    });

    allFilteredCrime.forEach(crime => {
        const crimeDate = format(parseISO(crime.date), 'yyyy-MM-dd');
        if (historicalCounts.has(crimeDate)) {
            historicalCounts.set(crimeDate, historicalCounts.get(crimeDate)! + 1);
        }
    });

    const historicalDataForPrompt = Array.from(historicalCounts.entries()).map(([date, count]) => ({ date, count }));

    const analysisPrompt = `
      [
        ${historicalDataForPrompt.map(d => `{ "date": "${d.date}", "crime_count": ${d.count} }`).join(',\n')}
      ]
    `;

    // 3. Identify future dates that need prediction
    const futureDates = allDatesInRange
        .filter(day => !isBefore(day, today))
        .map(day => format(day, 'yyyy-MM-dd'));

    if (futureDates.length === 0) {
        // No future dates, just return historical data
        return {
            dailyData: historicalDataForPrompt.map(d => ({ date: d.date, historicalCount: d.count, predictedCount: null })),
            crimeTypeBreakdown: []
        };
    }

    // 4. Call the AI for predictions on future dates
    const { output: predictionOutput } = await prompt({ analysisPrompt, input, futureDates });

    if (!predictionOutput) {
        throw new Error("AI model did not return an output.");
    }
    
    // 5. Combine historical and predicted data
    const combinedDailyData: z.infer<typeof DailyPredictionSchema>[] = [];
    
    // Add historical data points
    historicalDataForPrompt.forEach(d => {
        combinedDailyData.push({
            date: d.date,
            historicalCount: d.count,
            predictedCount: null
        });
    });

    // Add predicted data points from the model's output
    predictionOutput.dailyData.forEach(p => {
        if (futureDates.includes(p.date)) {
             combinedDailyData.push({
                date: p.date,
                historicalCount: null,
                predictedCount: p.predictedCount ?? 0,
            });
        }
    });

    // Ensure all future dates have an entry, even if the model missed one
    futureDates.forEach(date => {
        if (!combinedDailyData.some(d => d.date === date)) {
            combinedDailyData.push({ date, historicalCount: null, predictedCount: 0 });
        }
    });


    combinedDailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
        dailyData: combinedDailyData,
        crimeTypeBreakdown: predictionOutput.crimeTypeBreakdown
    };
  }
);
