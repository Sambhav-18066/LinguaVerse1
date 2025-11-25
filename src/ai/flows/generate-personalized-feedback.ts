'use server';

/**
 * @fileOverview Generates personalized feedback on spoken English, including suggestions for grammar, vocabulary, and pronunciation.
 *
 * - generatePersonalizedFeedback - A function that generates personalized feedback on spoken English.
 * - GeneratePersonalizedFeedbackInput - The input type for the generatePersonalizedFeedback function.
 * - GeneratePersonalizedFeedbackOutput - The return type for the generatePersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedFeedbackInputSchema = z.object({
  spokenText: z
    .string()
    .describe('The spoken text from the user to provide feedback on.'),
  feedbackRequest: z
    .string()
    .optional()
    .describe('Optional user request for a specific type of feedback.'),
  assessment: z.object({
    fluency: z.number(),
    lexicalRichness: z.number(),
    reflectiveTurns: z.number(),
    autobiographicalDepth: z.number(),
    conversationInitiative: z.number(),
    narrativeContinuity: z.number(),
  }).optional().describe('The speaking skill assessment scores.'),
});
export type GeneratePersonalizedFeedbackInput = z.infer<typeof GeneratePersonalizedFeedbackInputSchema>;

const GeneratePersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the spoken English.'),
});
export type GeneratePersonalizedFeedbackOutput = z.infer<typeof GeneratePersonalizedFeedbackOutputSchema>;

export async function generatePersonalizedFeedback(input: GeneratePersonalizedFeedbackInput): Promise<GeneratePersonalizedFeedbackOutput> {
  return generatePersonalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedFeedbackPrompt',
  input: {schema: GeneratePersonalizedFeedbackInputSchema},
  output: {schema: GeneratePersonalizedFeedbackOutputSchema},
  prompt: `You are an AI language tutor. Your primary role is to help users improve their spoken English.

  The user has spoken the following text:
  {{{spokenText}}}

  {{#if assessment}}
  Here is the user's current speaking assessment scores:
  - Fluency: {{{assessment.fluency}}}/150 WPM
  - Lexical Richness: {{{assessment.lexicalRichness}}}/10
  - Reflective Turns: {{{assessment.reflectiveTurns}}}/10
  - Autobiographical Depth: {{{assessment.autobiographicalDepth}}}/10
  - Conversation Initiative: {{{assessment.conversationInitiative}}}/10
  - Narrative Continuity: {{{assessment.narrativeContinuity}}}/10

  Use these scores to inform your feedback. For example, if fluency is low, suggest ways to improve it.
  {{/if}}

  {{#if feedbackRequest}}
  The user has a specific request: '{{{feedbackRequest}}}'. Please prioritize this in your response.
  {{/if}}

  Provide feedback on grammar, vocabulary, and pronunciation, and offer concrete suggestions for improvement.
  Your feedback should be tailored to the user's specific needs and level of proficiency.
  Focus on the most important areas for improvement and provide clear, actionable steps.
`,
});

const generatePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedFeedbackFlow',
    inputSchema: GeneratePersonalizedFeedbackInputSchema,
    outputSchema: GeneratePersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
