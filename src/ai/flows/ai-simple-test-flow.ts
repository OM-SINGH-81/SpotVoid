'use server';

/**
 * @fileOverview A simple test flow to list available models.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { listModels } from 'genkit/ai';


export const simpleTestFlow = ai.defineFlow(
  {
    name: 'simpleTestFlow',
    inputSchema: z.null(),
    outputSchema: z.any(),
  },
  async () => {
    const models = await listModels();
    // We are only interested in models that support text generation
    const generationModels = models.filter(m => m.supports?.generate);

    return generationModels.map(m => ({
        name: m.name,
        label: m.label,
        version: m.version,
    }));
  }
);
