'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating conversation topics.
 *
 * - generateConversationTopics - A function that generates conversation topics based on user interests and proficiency level.
 * - GenerateConversationTopicsInput - The input type for the generateConversationTopics function.
 * - GenerateConversationTopicsOutput - The return type for the generateConversationTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConversationTopicsInputSchema = z.object({
  interests: z
    .string()
    .describe('The user interests, comma separated. e.g. Music, Travel, Food'),
  proficiencyLevel: z
    .string()
    .describe(
      'The user proficiency level in English. e.g. Beginner, Intermediate, Advanced'
    ),
});
export type GenerateConversationTopicsInput = z.infer<
  typeof GenerateConversationTopicsInputSchema
>;

const GenerateConversationTopicsOutputSchema = z.object({
  topics: z
    .array(z.string())
    .describe('An array of conversation topics based on the user interests and proficiency level.'),
});
export type GenerateConversationTopicsOutput = z.infer<
  typeof GenerateConversationTopicsOutputSchema
>;

export async function generateConversationTopics(
  input: GenerateConversationTopicsInput
): Promise<GenerateConversationTopicsOutput> {
  return generateConversationTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConversationTopicsPrompt',
  input: {schema: GenerateConversationTopicsInputSchema},
  output: {schema: GenerateConversationTopicsOutputSchema},
  prompt: `You are an AI conversation starter that helps English language learners practice speaking.

  Generate conversation topics based on the user's interests and proficiency level.

  Interests: {{{interests}}}
  Proficiency Level: {{{proficiencyLevel}}}

  Format the topics as a JSON array of strings.
  `,
});

const generateConversationTopicsFlow = ai.defineFlow(
  {
    name: 'generateConversationTopicsFlow',
    inputSchema: GenerateConversationTopicsInputSchema,
    outputSchema: GenerateConversationTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
