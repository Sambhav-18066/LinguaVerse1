import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {configureGenkit} from 'genkit';

configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
