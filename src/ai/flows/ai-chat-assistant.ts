
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
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  tools: [getCrimeData],
  model: 'gemini-1.5-flash',
  prompt: `You are a helpful assistant that answers questions about crime data. 
  
  Instructions:
  1. Use the available 'getCrimeData' tool to answer the user's question as accurately as possible.
  2. Synthesize the data returned by the tool into a clear, natural language answer.
  3. If the tool returns no data, state that you couldn't find any information for that query.
  4. Your final response must be a valid JSON object with the "answer" field populated.

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
    if (!output) {
      return { answer: "I'm sorry, I was unable to process that request." };
    }
    return output;
  }
);
