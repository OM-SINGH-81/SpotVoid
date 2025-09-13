'use server';

/**
 * @fileOverview An AI flow for generating optimized patrol routes.
 *
 * - generatePatrolRoute - A function that generates an optimized patrol route based on crime data.
 * - GeneratePatrolRouteInput - The input type for the generatePatrolRoute function.
 * - GeneratePatrolRouteOutput - The return type for the generatePatrolRoute function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCrimeData } from '@/ai/tools/crime-data-tool';

const GeneratePatrolRouteInputSchema = z.object({
    dateRange: z.object({
        startDate: z.string().optional().describe('The start date for the filter range (ISO 8601 format).'),
        endDate: z.string().optional().describe('The end date for the filter range (ISO 8601 format).'),
    }),
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
    input: { schema: GeneratePatrolRouteInputSchema },
    output: { schema: GeneratePatrolRouteOutputSchema },
    tools: [getCrimeData],
    prompt: `You are an AI assistant that generates optimized patrol routes for police based on crime data.
    
    Your task is to identify 5-7 crime hotspots using the available crime data and then create a patrol route that covers these hotspots in the most efficient order (solving the Traveling Salesperson Problem).
    
    Use the getCrimeData tool to fetch relevant crime incidents based on the user's filters:
    - Date Range: {{{dateRange.startDate}}} to {{{dateRange.endDate}}}
    - Police Station: {{{policeStation}}}
    - Crime Types: {{#each crimeTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    
    Analyze the retrieved crime data to identify geographical clusters of incidents. These clusters will be your hotspots.
    
    Then, determine the shortest possible path to visit all hotspots, starting and ending at a logical point (e.g., the associated police station area). The output should be an ordered list of these hotspots.
    
    Each hotspot in your response must have a unique ID, a descriptive name (e.g., "Hotspot 1"), its geographic coordinates (lat, lng), and its order in the patrol sequence (starting from 1).
    
    Finally, calculate the total estimated distance of the route in kilometers and the estimated time to complete it in minutes.
    
    Generate a valid JSON object that matches the specified output schema.`,
});

const generatePatrolRouteFlow = ai.defineFlow(
    {
        name: 'generatePatrolRouteFlow',
        inputSchema: GeneratePatrolRouteInputSchema,
        outputSchema: GeneratePatrolRouteOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
