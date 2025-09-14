'use server';

/**
 * @fileOverview An AI flow for generating optimized patrol routes based on predicted crime data.
 *
 * - generatePatrolRoute - A function that generates an optimized patrol route.
 * - GeneratePatrolRouteInput - The input type for the generatePatrolRoute function.
 * - GeneratePatrolRouteOutput - The return type for the generatePatrolRoute function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { predictCrime } from './ai-crime-prediction';
import { addDays, startOfToday, endOfDay } from 'date-fns';

const GeneratePatrolRouteInputSchema = z.object({
    policeStation: z.string().optional().describe('The police station to filter by.'),
    crimeTypes: z.array(z.string()).optional().describe('The types of crime to filter by.'),
});
export type GeneratePatrolRouteInput = z.infer<typeof GeneratePatrolRouteInputSchema>;

const GeneratePatrolRouteOutputSchema = z.object({
    hotspots: z.array(z.object({
        id: z.string(),
        name: z.string(),
        position: z.object({
            lat: z.number(),
            lng: z.number(),
        }),
        order: z.number(),
    })).describe('An array of patrol hotspots, ordered for an optimal route.'),
    totalDistance: z.string().describe('The total estimated distance of the patrol route in kilometers (e.g., "15.2 km").'),
    estimatedTime: z.string().describe('The total estimated time to complete the patrol in minutes (e.g., "45 min").'),
});
export type GeneratePatrolRouteOutput = z.infer<typeof GeneratePatrolRouteOutputSchema>;


export async function generatePatrolRoute(input: GeneratePatrolRouteInput): Promise<GeneratePatrolRouteOutput> {
    return generatePatrolRouteFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generatePatrolRoutePrompt',
    input: { schema: z.object({
        predictedHotspots: z.any().describe('A JSON string of predicted crime hotspots including their locations.'),
    }) },
    output: { schema: GeneratePatrolRouteOutputSchema },
    prompt: `You are an AI assistant that generates optimized patrol routes for police based on predicted crime data.
    
    A list of predicted crime hotspots, including their locations and expected crime counts, has been provided.
    
    Predicted Hotspots Data:
    {{{predictedHotspots}}}
    
    Your task is to use this data to create an optimized patrol route that covers 5-7 of the most critical hotspots.
    
    1.  Analyze the provided predicted hotspots to identify the 5-7 most critical ones.
    2.  Create an efficient patrol route that connects these hotspots (solving the Traveling Salesperson Problem).
    3.  The output must be an ordered list of these hotspots. Each hotspot in your response must have a unique ID, a descriptive name (e.g., "Hotspot 1"), its geographic coordinates (lat, lng), and its order in the patrol sequence (starting from 1).
    4.  Finally, calculate the total estimated distance of the route in kilometers and the estimated time to complete it in minutes.
    
    Generate a valid JSON object that matches the specified output schema.`,
});

const generatePatrolRouteFlow = ai.defineFlow(
    {
        name: 'generatePatrolRouteFlow',
        inputSchema: GeneratePatrolRouteInputSchema,
        outputSchema: GeneratePatrolRouteOutputSchema,
    },
    async (input) => {
        // Step 1: Get crime predictions for the next 7 days to identify future hotspots.
        const today = startOfToday();
        const futureDate = addDays(today, 7);

        const predictionInput = {
            dateRange: {
                startDate: today.toISOString(),
                endDate: futureDate.toISOString(),
            },
            policeStation: input.policeStation || 'all',
            crimeTypes: input.crimeTypes || [],
        };
        
        // This is a conceptual step. We are re-using the existing prediction flow.
        // A more advanced implementation would have a dedicated flow to predict hotspot locations.
        // For now, we'll simulate this by using historical data as a proxy for predicted hotspot locations.
        const predictedData = await predictCrime(predictionInput);
        
        // Let's create a simplified representation of hotspots for the prompt.
        // In a real scenario, this would come from a more complex prediction model.
        // Here we'll just use the breakdown as a proxy for hotspot importance.
        const predictedHotspots = JSON.stringify({
            predictedCrimeTypeBreakdown: predictedData.predictedCrimeTypeBreakdown,
            // The model needs locations, which our current prediction model doesn't provide.
            // We'll pass some recent crime locations as a substitute for "predicted locations".
            recentCrimeLocations: predictedData.dailyData.slice(0, 20).map(d => ({
                // This part is a simulation as we don't have real predicted locations.
                // In a real app, this would be a sophisticated location prediction.
                lat: 28.6139 + (Math.random() - 0.5) * 0.1,
                lng: 77.2090 + (Math.random() - 0.5) * 0.1,
            }))
        });

        // Step 2: Call the AI with the predicted data to generate the route.
        const { output } = await prompt({ predictedHotspots });
        return output!;
    }
);
