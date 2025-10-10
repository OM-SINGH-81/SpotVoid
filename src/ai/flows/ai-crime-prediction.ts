
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
import { googleAI } from '@genkit-ai/google-genai';

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

const PredictedHotspotSchema = z.object({
    id: z.string().describe("A unique identifier for the hotspot (e.g., 'hotspot-1')."),
    position: z.object({
        lat: z.number().describe('The latitude of the hotspot.'),
        lng: z.number().describe('The longitude of the hotspot.'),
    }).describe('The geographic coordinates of the predicted hotspot.'),
    riskLevel: z.enum(['High', 'Medium', 'Low']).describe('The predicted risk level for this hotspot.'),
    reason: z.string().describe('A brief explanation for why this area is considered a hotspot.'),
    predictedCrimeType: z.string().describe('The most likely type of crime to occur at this hotspot.'),
    locationName: z.string().describe('A recognizable name for the location of the hotspot (e.g., a neighborhood, market, or landmark).'),
});

const PredictCrimeOutputSchema = z.object({
  dailyData: z.array(DailyPredictionSchema).describe('Historical and predicted crime counts per day for the specified date range.'),
  predictedCrimeTypeBreakdown: CrimeTypeBreakdownSchema.describe('Predicted breakdown of crime types for the future dates in the specified police station.'),
  historicalCrimeTypeBreakdown: CrimeTypeBreakdownSchema.describe('Historical breakdown of crime types for the past dates in the specified police station.'),
  predictedHotspots: z.array(PredictedHotspotSchema).describe('A list of predicted geographical crime hotspots for the future period.'),
});
export type PredictCrimeOutput = z.infer<typeof PredictCrimeOutputSchema>;


export async function predictCrime(input: PredictCrimeInput): Promise<PredictCrimeOutput> {
  return predictCrimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCrimePrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: {schema: z.object({
    analysisPrompt: z.string(),
    futureDates: z.array(z.string()),
    input: PredictCrimeInputSchema,
    historicalCrimeLocations: z.string().describe('A JSON string of historical crime locations for context.'),
  })},
  output: {schema: z.object({
    dailyData: z.array(z.object({
        date: z.string(),
        predictedCount: z.number().nullable(),
    })).describe('Predicted crime counts for future dates.'),
    crimeTypeBreakdown: CrimeTypeBreakdownSchema.describe('Predicted breakdown of crime types for the future period.'),
    predictedHotspots: z.array(PredictedHotspotSchema).describe('A list of 3-5 predicted geographical crime hotspots for the future period. Base these on historical location clusters.'),
  })},
  prompt: `You are an AI assistant that analyzes historical crime data and predicts future crime rates and locations.

  Historical Data Analysis:
  - Daily Counts: {{{analysisPrompt}}}
  - Incident Locations: {{{historicalCrimeLocations}}}
  
  Based on this historical data, identify temporal trends (like weekly patterns, increases/decreases) and spatial clusters (geographic concentrations of crime). Use this analysis to provide a realistic future crime prediction.
  
  User's Request:
  - Prediction for Dates: {{#each futureDates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Police Station: {{{input.policeStation}}}
  - Crime Types: {{#each input.crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  
  Instructions:
  1.  Create a 'dailyData' array for the future dates listed above, providing a 'predictedCount' for each.
  2.  Provide a 'crimeTypeBreakdown' of the total *predicted* crimes for the future period.
  3.  Crucially, identify 3-5 potential 'predictedHotspots'. For each hotspot, provide its coordinates, a risk level, a reason for the prediction, the most likely crime type, and a recognizable 'locationName' (e.g., "Karol Bagh Market", "Connaught Place Inner Circle"). These hotspots should be plausible based on the historical location data.
  
  Your entire output must be a valid JSON object matching the requested output schema. Do not include past dates in your 'dailyData' output.`,
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

    // 1. Get all data matching the filters within the date range
    let allFilteredCrime = crimeData.filter(crime => {
        const crimeDate = parseISO(crime.date);
        const isDateInRange = crimeDate >= start && crimeDate <= end;
        const isStationMatch = input.policeStation === 'all' || crime.policeStation === input.policeStation;
        const isCrimeTypeMatch = input.crimeTypes.includes(crime.crimeType);
        return isDateInRange && isStationMatch && isCrimeTypeMatch;
    });

    // 2. Create counts for historical dates within the requested range
    const historicalCounts = new Map<string, number>();
    const allDatesInRange = eachDayOfInterval({ start, end });
    const historicalDateObjects = allDatesInRange.filter(day => isBefore(day, today));
    
    historicalDateObjects.forEach(day => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        historicalCounts.set(formattedDate, 0);
    });

    const historicalCrimes = allFilteredCrime.filter(crime => isBefore(parseISO(crime.date), today));

    historicalCrimes.forEach(crime => {
        const crimeDate = format(parseISO(crime.date), 'yyyy-MM-dd');
        if (historicalCounts.has(crimeDate)) {
            historicalCounts.set(crimeDate, historicalCounts.get(crimeDate)! + 1);
        }
    });

    const historicalDataForPrompt = Array.from(historicalCounts.entries()).map(([date, count]) => ({ date, count }));

    // 3. Calculate historical crime type breakdown
    const historicalCrimeTypeBreakdown = new Map<string, number>();
    input.crimeTypes.forEach(ct => historicalCrimeTypeBreakdown.set(ct, 0));

    historicalCrimes.forEach(crime => {
        if (historicalCrimeTypeBreakdown.has(crime.crimeType)) {
            historicalCrimeTypeBreakdown.set(crime.crimeType, historicalCrimeTypeBreakdown.get(crime.crimeType)! + 1);
        }
    });

    const historicalBreakdown = Array.from(historicalCrimeTypeBreakdown.entries()).map(([crimeType, count]) => ({ crimeType, count }));


    const analysisPrompt = JSON.stringify(historicalDataForPrompt);
    const historicalCrimeLocations = JSON.stringify(historicalCrimes.map(c => ({ lat: c.position.lat, lng: c.position.lng, crimeType: c.crimeType })));

    // 4. Identify future dates that need prediction
    const futureDates = allDatesInRange
        .filter(day => !isBefore(day, today))
        .map(day => format(day, 'yyyy-MM-dd'));

    if (futureDates.length === 0) {
        // No future dates, just return historical data
        return {
            dailyData: historicalDataForPrompt.map(d => ({ date: d.date, historicalCount: d.count, predictedCount: null })),
            predictedCrimeTypeBreakdown: [],
            historicalCrimeTypeBreakdown: historicalBreakdown,
            predictedHotspots: [],
        };
    }

    // 5. Call the AI for predictions on future dates
    const { output: predictionOutput } = await prompt({ analysisPrompt, input, futureDates, historicalCrimeLocations });

    if (!predictionOutput) {
        throw new Error("AI model did not return an output.");
    }
    
    // 6. Combine historical and predicted data
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
        predictedCrimeTypeBreakdown: predictionOutput.crimeTypeBreakdown,
        historicalCrimeTypeBreakdown: historicalBreakdown,
        predictedHotspots: predictionOutput.predictedHotspots || [],
    };
  }
);

    
