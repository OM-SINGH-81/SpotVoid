
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
import { eachDayOfInterval, format, parseISO, isBefore, isAfter, startOfToday, subDays } from 'date-fns';

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

const CrimeTypeBreakdownSchema = z.array(
  z.object({
    crimeType: z.string().describe('The type of crime.'),
    count: z.number().describe('The number of crimes of that type.'),
  })
);

const PredictCrimeOutputSchema = z.object({
  dailyData: z.array(DailyPredictionSchema).describe('Historical and predicted crime counts per day for the specified date range.'),
  predictedCrimeTypeBreakdown: CrimeTypeBreakdownSchema.describe('Predicted breakdown of crime types for the future dates in the specified police station.'),
  historicalCrimeTypeBreakdown: CrimeTypeBreakdownSchema.describe('Historical breakdown of crime types for the past dates in the specified police station.'),
});
export type PredictCrimeOutput = z.infer<typeof PredictCrimeOutputSchema>;


export async function predictCrime(input: PredictCrimeInput): Promise<PredictCrimeOutput> {
  return predictCrimeFlow(input);
}

const predictCrimePrompt = ai.definePrompt({
    name: 'predictCrimePrompt',
    model: 'gemini-1.5-flash',
    input: {
      schema: z.object({
        historicalSummary: z.string(),
        futureDates: z.array(z.string()),
        crimeTypes: z.array(z.string()),
      }),
    },
    output: {
      schema: z.object({
        dailyPredictions: z
          .array(
            z.object({
              date: z.string(),
              predictedCount: z.number().nullable(),
            })
          )
          .describe('Predicted crime counts for the future dates provided.'),
        predictedBreakdown: CrimeTypeBreakdownSchema.describe(
          'A plausible breakdown of the total predicted crimes by type.'
        ),
      }),
    },
    prompt: `You are an AI crime analyst. Based on the historical summary, predict crime trends for the upcoming dates.
  
  Historical Summary:
  {{{historicalSummary}}}
  
  Your task is to predict the daily crime counts for the following future dates: {{#each futureDates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  
  Also, provide a plausible breakdown of the total predicted crimes for these future dates across the following crime types: {{#each crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  
  Your entire response must be a valid JSON object matching the output schema. Ensure that you provide a prediction for every future date requested. The predicted counts should be reasonable based on the historical average.
  `,
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
  
      const allDays = eachDayOfInterval({ start, end });
      const pastAndTodayDays = allDays.filter(d => !isAfter(d, today));
      const futureDays = allDays.filter(d => isAfter(d, today));
      const futureDates = futureDays.map(day => format(day, 'yyyy-MM-dd'));

      // 1. Filter crimes for the historical period
      const historicalCrimes = crimeData.filter((crime) => {
        const crimeDate = parseISO(crime.date);
        const isDateInRange = crimeDate >= start && crimeDate <= today;
        const isStationMatch =
          input.policeStation === 'all' ||
          crime.policeStation === input.policeStation;
        const isCrimeTypeMatch = input.crimeTypes.includes(crime.crimeType);
        return isDateInRange && isStationMatch && isCrimeTypeMatch;
      });
  
      // 2. Aggregate historical data for output
      const historicalCounts = new Map<string, number>();
      const historicalBreakdown = new Map<string, number>();
      input.crimeTypes.forEach((ct) => historicalBreakdown.set(ct, 0));
  
      // Initialize all past days in the range with 0
      pastAndTodayDays.forEach(day => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          historicalCounts.set(formattedDate, 0);
      });
      
      historicalCrimes.forEach((crime) => {
        const crimeDate = format(parseISO(crime.date), 'yyyy-MM-dd');
        if (historicalCounts.has(crimeDate)) {
          historicalCounts.set(crimeDate, historicalCounts.get(crimeDate)! + 1);
        }
        if (historicalBreakdown.has(crime.crimeType)) {
            historicalBreakdown.set(crime.crimeType, historicalBreakdown.get(crime.crimeType)! + 1);
        }
      });
      
      const historicalDataForOutput = Array.from(historicalCounts.entries()).map(
        ([date, count]) => ({
          date,
          historicalCount: count,
          predictedCount: null,
        })
      );
  
      const historicalBreakdownForOutput = Array.from(historicalBreakdown.entries())
        .map(([crimeType, count]) => ({ crimeType, count }));
  
      // 3. Create a simple summary for the AI
      const totalHistoricalCrimes = historicalDataForOutput.reduce((acc, curr) => acc + (curr.historicalCount || 0), 0);
      const days = historicalDataForOutput.length || 1;
      const historicalSummary = `For police station '${input.policeStation}' and crime types [${input.crimeTypes.join(', ')}], there were a total of ${totalHistoricalCrimes} incidents over the last ${days} days. The daily average was about ${(totalHistoricalCrimes / days).toFixed(1)} incidents.`;
  
      
      if (futureDates.length === 0) {
        return {
          dailyData: historicalDataForOutput,
          predictedCrimeTypeBreakdown: [],
          historicalCrimeTypeBreakdown: historicalBreakdownForOutput,
        };
      }
  
      // 5. Call the AI
      try {
        const { output: predictionOutput } = await predictCrimePrompt({
          historicalSummary,
          futureDates,
          crimeTypes: input.crimeTypes
        });
    
        if (!predictionOutput) {
          throw new Error('AI model did not return a valid prediction.');
        }
    
        // 6. Combine data for the final output
        const combinedDailyData: z.infer<typeof DailyPredictionSchema>[] = [
          ...historicalDataForOutput,
        ];
  
        predictionOutput.dailyPredictions.forEach(p => {
          if (futureDates.includes(p.date)) {
              combinedDailyData.push({
                  date: p.date,
                  historicalCount: null,
                  predictedCount: p.predictedCount ?? 0,
              });
          }
        });
  
        // Ensure all future dates have an entry, even if the model misses them
        futureDates.forEach(date => {
          if (!combinedDailyData.some(d => d.date === date && d.predictedCount !== null)) {
              combinedDailyData.push({ date, historicalCount: null, predictedCount: 0 });
          }
        });
  
        combinedDailyData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
        return {
          dailyData: combinedDailyData,
          predictedCrimeTypeBreakdown: predictionOutput.predictedBreakdown,
          historicalCrimeTypeBreakdown: historicalBreakdownForOutput,
        };
      } catch (e) {
          console.error("AI Prediction failed in flow", e);
          // If AI fails, return historical data and empty predictions
          const dailyDataWithEmptyPredictions = [
            ...historicalDataForOutput,
            ...futureDates.map(date => ({ date, historicalCount: null, predictedCount: 0}))
          ];
          dailyDataWithEmptyPredictions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          return {
            dailyData: dailyDataWithEmptyPredictions,
            predictedCrimeTypeBreakdown: [],
            historicalCrimeTypeBreakdown: historicalBreakdownForOutput,
          };
      }
    }
  );
  
  
