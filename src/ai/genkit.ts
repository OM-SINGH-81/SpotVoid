
import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let aiInstance: Genkit | null = null;

export function getAi(): Genkit {
  if (aiInstance) {
    return aiInstance;
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not defined. Please set it in your .env file.'
    );
  }

  aiInstance = genkit({
    plugins: [
      googleAI({
        apiKey: process.env.GEMINI_API_KEY,
      }),
    ],
  });

  return aiInstance;
}

// Backwards compatibility for any file that might still be using the direct export.
export const ai = new Proxy({} as Genkit, {
    get: (target, prop) => {
        const instance = getAi();
        return Reflect.get(instance, prop);
    }
});
