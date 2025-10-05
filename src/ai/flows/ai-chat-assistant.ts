
'use server';

/**
 * @fileOverview A chat assistant that answers questions about crime data.
 *
 * - askQuestion - A function that takes a question as input and returns an answer.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getCrimeData } from '@/ai/tools/crime-data-tool';
import { googleAI } from '@genkit-ai/google-genai';

const AskQuestionInputSchema = z.object({
  question: z.string().describe('The question to ask about crime data.'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  tools: [getCrimeData],
  prompt: `You are a helpful assistant that answers questions about crime data. Use the available tools to answer the question as accurately as possible.

Question: {{{question}}}`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
