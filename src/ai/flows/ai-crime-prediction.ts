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
import { eachDayOfInterval, format, parseISO, isAfter, startOfToday, endOfDay } from 'date-fns';

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
    model: 'gemini-pro',
    input: {
      schema: z.object({
        historicalData: z.string().describe('A JSON string of historical crime incidents.'),
        futureDates: z.array(z.string()),
        crimeTypes: z.array(z.string()),
        policeStation: z.string(),
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
    prompt: `You are an AI crime analyst. Based on the provided historical crime data, predict crime trends for the upcoming dates for the specified police station and crime types.
  
  Police Station: {{{policeStation}}}
  Crime Types: {{#each crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Historical Data (JSON):
  {{{historicalData}}}
  
  Your task is to predict the daily crime counts for the following future dates: {{#each futureDates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  
  Also, provide a plausible breakdown of the total predicted crimes for these future dates across the specified crime types.
  
  Your entire response must be a valid JSON object matching the output schema. Ensure that you provide a prediction for every future date requested. The predicted counts should be reasonable based on the historical data.
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
      const end = endOfDay(parseISO(endDate));
      const today = startOfToday();
  
      const allDays = eachDayOfInterval({ start, end });
      const pastAndTodayDays = allDays.filter(d => !isAfter(d, today));
      const futureDays = allDays.filter(d => isAfter(d, today));
      const futureDates = futureDays.map(day => format(day, 'yyyy-MM-dd'));

      // Filter for all relevant crimes based on station and type
      const relevantCrimes = crimeData.filter((crime) => {
        const isStationMatch =
          input.policeStation === 'all' ||
          crime.policeStation === input.policeStation;
        const isCrimeTypeMatch = input.crimeTypes.includes(crime.crimeType);
        return isStationMatch && isCrimeTypeMatch;
      });

      const historicalCounts = new Map<string, number>();
      const historicalBreakdown = new Map<string, number>();
      input.crimeTypes.forEach((ct) => historicalBreakdown.set(ct, 0));
      
      pastAndTodayDays.forEach(day => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          historicalCounts.set(formattedDate, 0);
      });
      
      const relevantHistoricalCrimes = relevantCrimes.filter(crime => {
          const crimeDate = parseISO(crime.date);
          return crimeDate >= start && crimeDate <= end && !isAfter(crimeDate, today);
      });

      relevantHistoricalCrimes.forEach((crime) => {
        const formattedDate = format(parseISO(crime.date), 'yyyy-MM-dd');
        if (historicalCounts.has(formattedDate)) {
          historicalCounts.set(formattedDate, historicalCounts.get(formattedDate)! + 1);
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
      ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
      const historicalBreakdownForOutput = Array.from(historicalBreakdown.entries())
        .map(([crimeType, count]) => ({ crimeType, count }));
  
      if (futureDates.length === 0) {
        return {
          dailyData: historicalDataForOutput,
          predictedCrimeTypeBreakdown: [],
          historicalCrimeTypeBreakdown: historicalBreakdownForOutput,
        };
      }
  
      try {
        const historicalDataForPrompt = relevantHistoricalCrimes.map(c => ({
            date: format(parseISO(c.date), 'yyyy-MM-dd'),
            crimeType: c.crimeType,
            policeStation: c.policeStation,
        }));

        const { output: predictionOutput } = await predictCrimePrompt({
          historicalData: JSON.stringify(historicalDataForPrompt),
          futureDates,
          crimeTypes: input.crimeTypes,
          policeStation: input.policeStation,
        });
    
        if (!predictionOutput) {
          throw new Error('AI model did not return a valid prediction.');
        }
    
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
  
        // Ensure all future dates have a value, even if it's 0, to prevent gaps in the chart
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
