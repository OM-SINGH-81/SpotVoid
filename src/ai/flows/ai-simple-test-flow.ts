'use server';

/**
 * @fileOverview A simple test flow to verify the connection to the AI model.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const simpleTestFlow = ai.defineFlow(
  {
    name: 'simpleTestFlow',
    inputSchema: z.null(),
    outputSchema: z.string(),
  },
  async () => {
    const { text } = await ai.generate({
      model: 'gemini-1.5-pro-latest',
      prompt: 'Hello',
    });
    return text;
  }
);
