'use server';

/**
 * @fileOverview An AI flow for generating predictive alerts for women's safety.
 *
 * - generateWomensSafetyAlerts - A function that analyzes crime data and generates safety alerts.
 * - GenerateWomensSafetyAlertsOutput - The return type for the function.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';
import { crimeData } from '@/lib/mock-data';
import { isWithinInterval, subDays } from 'date-fns';

const AlertSchema = z.object({
    id: z.string().describe('A unique ID for the alert (e.g., "alert-1").'),
    title: z.string().describe('A concise title for the alert (e.g., "High Risk: Karol Bagh Market Area").'),
    reason: z.string().describe('A brief explanation for why the alert was generated.'),
    severity: z.enum(['High', 'Medium', 'Low']).describe('The severity level of the alert.'),
    location: z.string().describe('The general location or police station associated with the alert.'),
});

const GenerateWomensSafetyAlertsOutputSchema = z.object({
    alerts: z.array(AlertSchema).describe('An array of predictive safety alerts.'),
});
export type GenerateWomensSafetyAlertsOutput = z.infer<typeof GenerateWomensSafetyAlertsOutputSchema>;


export async function generateWomensSafetyAlerts(): Promise<GenerateWomensSafetyAlertsOutput> {
    return generateWomensSafetyAlertsFlow(null);
}

const prompt = getAi().definePrompt({
    name: 'womensSafetyAlertsPrompt',
    model: 'gemini-1.5-flash',
    input: { schema: z.object({
        womensSafetyCrimes: z.any().describe("A JSON string of recent crime incidents related to women's safety, including harassment, theft, and accidents."),
    }) },
    output: { schema: GenerateWomensSafetyAlertsOutputSchema },
    prompt: `You are a crime analyst AI for a police department. Your task is to analyze recent crime data related to women's safety and generate predictive alerts for areas that show emerging risk patterns.
    
    Recent Crime Data:
    {{{womensSafetyCrimes}}}
    
    Instructions:
    1.  Analyze the provided crime data, looking for clusters of incidents (3 or more) in specific locations (police stations) or at certain times.
    2.  Focus on crimes like Harassment, Theft, and Accidents that disproportionately affect women's safety.
    3.  If you identify a pattern or a significant cluster, generate a predictive alert.
    4.  Assign a 'severity' (High, Medium, Low) based on the number of incidents and the nature of the crimes.
    5.  Provide a concise 'title' and a 'reason' for each alert.
    6.  If no significant patterns are found, return an empty 'alerts' array.
    
    Generate a valid JSON object that matches the specified output schema.`,
});

const generateWomensSafetyAlertsFlow = getAi().defineFlow(
    {
        name: 'generateWomensSafetyAlertsFlow',
        inputSchema: z.null(),
        outputSchema: GenerateWomensSafetyAlertsOutputSchema,
    },
    async () => {
        // Get recent women-specific crimes (last 14 days)
        const recentCrimes = crimeData.filter(crime => {
            const crimeDate = new Date(crime.date);
            const isRecent = isWithinInterval(crimeDate, { start: subDays(new Date(), 14), end: new Date() });
            const isRelevantType = ['Harassment', 'Theft', 'Accident'].includes(crime.crimeType);
            return isRecent && isRelevantType;
        });

        const crimesForPrompt = JSON.stringify(recentCrimes.map(({ id, crimeType, date, policeStation }) => ({ id, crimeType, date, policeStation })));

        const { output } = await prompt({ womensSafetyCrimes: crimesForPrompt });
        
        if (!output) {
            return { alerts: [] };
        }

        return output;
    }
);
