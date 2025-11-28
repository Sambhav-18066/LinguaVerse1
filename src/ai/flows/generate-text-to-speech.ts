'use server';
/**
 * @fileOverview Converts text to speech using a Genkit flow.
 *
 * - generateTextToSpeech - A function that converts text to speech.
 * - GenerateTextToSpeechInput - The input type for the generateTextToSpeech function.
 * - GenerateTextToSpeechOutput - The return type for the generateTextToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GenerateTextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateTextToSpeechInput = z.infer<
  typeof GenerateTextToSpeechInputSchema
>;

const GenerateTextToSpeechOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated audio as a data URI. Format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type GenerateTextToSpeechOutput = z.infer<
  typeof GenerateTextToSpeechOutputSchema
>;

export async function generateTextToSpeech(
  input: GenerateTextToSpeechInput
): Promise<GenerateTextToSpeechOutput> {
  return generateTextToSpeechFlow(input);
}

const generateTextToSpeechFlow = ai.defineFlow(
  {
    name: 'generateTextToSpeechFlow',
    inputSchema: GenerateTextToSpeechInputSchema,
    outputSchema: GenerateTextToSpeechOutputSchema,
  },
  async (input) => {
    try {
        const { media } = await ai.generate({
            model: googleAI.model('tts-1'), // Use a stable TTS model
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Achernar' },
                  },
                },
            },
            prompt: input.text,
        });

        if (!media?.url) {
            throw new Error('No media URL returned from TTS API.');
        }

        return {
            audioDataUri: media.url,
        };
    } catch (error) {
        console.error('Error in generateTextToSpeechFlow:', error);
        throw new Error('Failed to generate text-to-speech audio.');
    }
  }
);
