import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

export const ai = genkit({
  model: 'googleai/gemini-2.5-flash',
});
