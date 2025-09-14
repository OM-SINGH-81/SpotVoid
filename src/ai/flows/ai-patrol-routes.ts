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
import type { PredictCrimeOutput } from './ai-crime-prediction';
import { crimeData } from '@/lib/mock-data';

const GeneratePatrolRouteInputSchema = z.object({
    predictedData: z.any().describe('The output from the crime prediction flow.'),
});
export type GeneratePatrolRouteInput = z.infer<typeof GeneratePatrolRouteInputSchema>;

const GeneratePatrolRouteOutputSchema = z.object({
    hotspots: z.array(z.object({
        id: z.string(),
        name: z.string().describe('A descriptive name for the hotspot, including its order and a general location name (e.g., "1. Connaught Place Area").'),
        description: z.string().describe('A detailed description of the hotspot\'s location, including nearby landmarks or areas.'),
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
        predictedHotspots: z.any().describe('A JSON string of predicted crime hotspots including their locations and types.'),
    }) },
    output: { schema: GeneratePatrolRouteOutputSchema },
    prompt: `You are an AI assistant that generates optimized patrol routes for police based on predicted crime data.
    
    A list of predicted crime hotspots, including their locations and expected crime counts, has been provided.
    
    Predicted Hotspots Data:
    {{{predictedHotspots}}}
    
    Your task is to use this data to create an optimized patrol route that covers 5-7 of the most critical hotspots.
    
    1.  Analyze the provided predicted hotspots to identify the 5-7 most critical ones.
    2.  Create an efficient patrol route that connects these hotspots.
    3.  The output must be an ordered list of these hotspots. For each hotspot, provide:
        - A unique ID (e.g., "hs-1").
        - A 'name' that includes its order number and a general location (e.g., "1. Karol Bagh Market").
        - A detailed 'description' of the location, mentioning nearby landmarks or areas for context.
        - Its geographic 'position' (lat, lng).
        - Its 'order' in the patrol sequence (starting from 1).
    4.  Finally, calculate the total estimated 'totalDistance' of the route in kilometers and the 'estimatedTime' to complete it in minutes.
    
    Generate a valid JSON object that matches the specified output schema.`,
});

const generatePatrolRouteFlow = ai.defineFlow(
    {
        name: 'generatePatrolRouteFlow',
        inputSchema: GeneratePatrolRouteInputSchema,
        outputSchema: GeneratePatrolRouteOutputSchema,
    },
    async (input) => {
        const { predictedData } = input as { predictedData: PredictCrimeOutput };

        const relevantCrimeData = crimeData.filter(crime => {
            const crimeDate = new Date(crime.date).getTime();
            return predictedData.dailyData.some(d => new Date(d.date).getTime() === crimeDate);
        }).map(c => ({ position: c.position, crimeType: c.crimeType }));
        
        const predictedHotspots = JSON.stringify({
            predictedCrimeTypeBreakdown: predictedData.predictedCrimeTypeBreakdown,
            recentCrimeLocations: relevantCrimeData,
        });

        const { output } = await prompt({ predictedHotspots });

        if (!output || !output.hotspots) {
            return {
                hotspots: [],
                totalDistance: "0 km",
                estimatedTime: "0 min",
            };
        }

        return output;
    }
);
