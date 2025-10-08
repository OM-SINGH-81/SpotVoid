'use server';
/**
 * @fileOverview A tool for querying crime data.
 * 
 * - getCrimeData - A Genkit tool that retrieves crime data based on specified filters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { crimeData } from '@/lib/mock-data';

const CrimeDataFilterSchema = z.object({
    crimeType: z.string().optional().describe('The type of crime to filter by (e.g., "Theft", "Accident"). If the user asks for all crimes or does not specify a type, do not use this field.'),
    policeStation: z.string().optional().describe('The police station to filter by (e.g., "Connaught Place"). If the user asks for all stations or does not specify one, do not use this field.'),
    startDate: z.string().optional().describe('The start date for the filter range in ISO 8601 format (YYYY-MM-DD). Use this for date-based queries like "last month" or "since August".'),
    endDate: z.string().optional().describe('The end date for the filter range in ISO 8601 format (YYYY-MM-DD). Use this with startDate to define a period.'),
});

export const getCrimeData = ai.defineTool(
    {
        name: 'getCrimeData',
        description: 'Retrieves a list of crime incidents based on the provided filters. Use this to answer questions about crime statistics, trends, and specific incidents. The AI should infer the date range and filters from the user\'s natural language query.',
        inputSchema: CrimeDataFilterSchema,
        outputSchema: z.array(z.object({
            id: z.string(),
            crimeType: z.string(),
            date: z.string(),
            policeStation: z.string(),
        })),
    },
    async (input) => {
        let filteredData = [...crimeData];

        if (input.crimeType) {
            filteredData = filteredData.filter(crime => crime.crimeType.toLowerCase() === input.crimeType?.toLowerCase());
        }

        if (input.policeStation) {
            filteredData = filteredData.filter(crime => crime.policeStation.toLowerCase() === input.policeStation?.toLowerCase());
        }

        if (input.startDate) {
            const startDate = new Date(input.startDate);
            startDate.setHours(0, 0, 0, 0); // Set to start of the day
            filteredData = filteredData.filter(crime => new Date(crime.date) >= startDate);
        }

        if (input.endDate) {
            const endDate = new Date(input.endDate);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            filteredData = filteredData.filter(crime => new Date(crime.date) <= endDate);
        }

        // Return a subset of fields to the model to keep the response concise.
        return filteredData.map(({ id, crimeType, date, policeStation }) => ({ id, crimeType, date, policeStation }));
    }
);
