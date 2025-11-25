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
  prompt: `You are an AI language tutor acting as a friendly, casual conversation partner. Your goal is to help users practice speaking English.

  IMPORTANT:
  - Keep your responses very short and to the point (1-2 sentences).
  - Your tone should be encouraging and friendly, like talking to a friend.
  - If the user asks a question or needs information, provide a helpful and direct answer before asking a follow-up question.
  - Ask engaging follow-up questions to keep the conversation flowing.
  - Do not act like a formal tutor unless specifically asked.

  The user has said:
  "{{{spokenText}}}"

  {{#if assessment}}
  Here are their recent scores. Use them to subtly guide the conversation, but do not mention them directly.
  - Fluency: {{{assessment.fluency}}}/150
  - Lexical Richness: {{{assessment.lexicalRichness}}}/10
  {{/if}}

  {{#if feedbackRequest}}
  The user has a specific request: '{{{feedbackRequest}}}'. Please prioritize this in your response.
  {{/if}}

  Now, provide a short, friendly, and engaging response.
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
