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

const MessageSchema = z.object({
  text: z.string(),
  isAI: z.boolean(),
});

const GeneratePersonalizedFeedbackInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe("The history of the conversation so far."),
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
  prompt: `You are an AI language tutor acting as a friendly, casual conversation partner named Amisha. Your goal is to help users practice speaking English.

  IMPORTANT:
  - Keep your responses very short and to the point (1-2 sentences), UNLESS the user asks you to generate content.
  - Your tone should be encouraging and friendly, like talking to a friend.
  - If the user asks a question or needs information, provide a helpful and direct answer before asking a follow-up question.
  - If the user asks you to generate content (like a story, a paragraph, or lines about a topic), generate the content as requested.
  - Ask engaging follow-up questions to keep the conversation flowing, but only after fulfilling any direct requests.
  - Do not act like a formal tutor unless specifically asked.

  Conversation History:
  {{#if history}}
    {{#each history}}
      {{#if this.isAI}}Amisha: {{this.text}}{{else}}User: {{this.text}}{{/if}}
    {{/each}}
  {{/if}}
  
  The user has just said:
  "{{{spokenText}}}"

  {{#if assessment}}
  Here are their recent scores. Use them to subtly guide the conversation, but do not mention them directly.
  - Fluency: {{{assessment.fluency}}}/150
  - Lexical Richness: {{{assessment.lexicalRichness}}}/10
  {{/if}}

  {{#if feedbackRequest}}
  The user has a specific request: '{{{feedbackRequest}}}'. Please prioritize this in your response.
  {{/if}}

  Now, provide a short, friendly, and engaging response as Amisha.
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
