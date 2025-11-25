'use server';
/**
 * @fileOverview Converts text to speech using a Genkit flow.
 *
 * - generateTextToSpeech - A function that converts text to speech.
 * - GenerateTextToSpeechInput - The input type for the generateTextToSpeech function.
 * - GenerateTextToSpeechOutput - The return type for the generateTextToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

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

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
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
        model: 'googleai/gemini-2.5-flash-preview-tts',
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

      if (!media) {
        throw new Error('No media returned from TTS API.');
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);

      return {
        audioDataUri: `data:audio/wav;base64,${wavBase64}`,
      };
    } catch (error) {
      console.error('Error generating text-to-speech:', error);
      return { audioDataUri: '' };
    }
  }
);
