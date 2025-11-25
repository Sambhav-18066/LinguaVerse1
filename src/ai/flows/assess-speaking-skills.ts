'use server';

/**
 * @fileOverview This file defines a Genkit flow for assessing speaking skills using the Speaking-of-Self rubric.
 *
 * - assessSpeakingSkills - A function that initiates the speaking skill assessment process.
 * - AssessSpeakingSkillsInput - The input type for the assessSpeakingSkills function.
 * - AssessSpeakingSkillsOutput - The return type for the assessSpeakingSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessSpeakingSkillsInputSchema = z.object({
  speechDataUri: z
    .string()
    .describe(
      'The speech recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type AssessSpeakingSkillsInput = z.infer<typeof AssessSpeakingSkillsInputSchema>;

const AssessSpeakingSkillsOutputSchema = z.object({
  fluency: z.number().describe('Speaking fluency (words per minute, pauses).'),
  lexicalRichness: z.number().describe('Lexical richness score.'),
  reflectiveTurns: z.number().describe('Number of reflective turns.'),
  autobiographicalDepth: z.number().describe('Autobiographical depth score.'),
  conversationInitiative: z.number().describe('Conversation initiative score.'),
  narrativeContinuity: z.number().describe('Narrative continuity score.'),
});
export type AssessSpeakingSkillsOutput = z.infer<typeof AssessSpeakingSkillsOutputSchema>;

export async function assessSpeakingSkills(input: AssessSpeakingSkillsInput): Promise<AssessSpeakingSkillsOutput> {
  return assessSpeakingSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessSpeakingSkillsPrompt',
  input: {schema: AssessSpeakingSkillsInputSchema},
  output: {schema: AssessSpeakingSkillsOutputSchema},
  prompt: `You are an expert in evaluating speaking skills based on the Speaking-of-Self rubric. Analyze the provided speech recording and provide scores for the following metrics:\n\n- Speaking Fluency (words per minute, pauses):\n- Lexical Richness:\n- Reflective Turns:\n- Autobiographical Depth:\n- Conversation Initiative:\n- Narrative Continuity:\n\nAnalyze the following speech recording:\n\n{{media url=speechDataUri}}\n\nProvide the output in JSON format. Ensure the data types match the schema.`,
});

const assessSpeakingSkillsFlow = ai.defineFlow(
  {
    name: 'assessSpeakingSkillsFlow',
    inputSchema: AssessSpeakingSkillsInputSchema,
    outputSchema: AssessSpeakingSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
