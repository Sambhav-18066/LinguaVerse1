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
  prompt: `You are an AI language tutor providing personalized feedback on spoken English.

  The user has spoken the following text:
  {{spokenText}}

  {% if feedbackRequest %}The user has requested the following specific feedback: {{feedbackRequest}}{% endif %}

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
