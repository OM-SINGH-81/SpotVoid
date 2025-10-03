'use server';
/**
 * @fileOverview A flow for listing available GenAI models.
 */

import { ai } from '@/ai/genkit';
import { listModels as listGenkitModels, type ModelReference } from 'genkit';
import { z } from 'genkit';


const ModelInfoSchema = z.object({
  name: z.string().describe('The model name/ID.'),
  label: z.string().optional().describe('A human-friendly label for the model.'),
  version: z.string().optional().describe('The model version.'),
  supports: z.any().optional().describe('Features supported by the model.'),
});

const ModelListSchema = z.array(ModelInfoSchema);

export type ModelList = z.infer<typeof ModelListSchema>;

export const listModels = ai.defineFlow(
  {
    name: 'listModelsFlow',
    inputSchema: z.null(),
    outputSchema: ModelListSchema,
  },
  async () => {
    const models = listGenkitModels();
    
    // We need to format the models to match our Zod schema.
    const formattedModels = models.map(m => ({
        name: m.name,
        label: m.label,
        version: m.version,
        supports: m.supports,
    }));

    return formattedModels;
  }
);
