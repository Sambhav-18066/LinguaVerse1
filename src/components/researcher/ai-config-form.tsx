'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { configureAiPersonality } from '@/ai/flows/configure-ai-personality';
import { useState } from 'react';

const formSchema = z.object({
  emotionalTone: z.string().min(10, 'Please provide a more detailed emotional tone.'),
  roleTakingBehavior: z.string().min(10, 'Please describe the role-taking behavior in more detail.'),
  scaffoldingPrompts: z.string().min(10, 'Please provide more detailed scaffolding prompts.'),
});

const defaultValues = {
    emotionalTone: "Empathetic and encouraging, showing patience and understanding. Use positive reinforcement.",
    roleTakingBehavior: "Act as a friendly language tutor, occasionally taking on roles like a 'tourist asking for directions' or a 'friend sharing a story' to prompt conversation.",
    scaffoldingPrompts: "If the user is stuck, offer sentence starters like 'You could say something like...'. Ask open-ended follow-up questions to encourage elaboration, such as 'That sounds interesting, can you tell me more about that?'"
};

export function AiConfigForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await configureAiPersonality(values);
      if (result.success) {
        toast({
          title: 'AI Personality Updated',
          description: 'The new configuration has been applied successfully.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to configure AI personality:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agentic AI Personality</CardTitle>
        <CardDescription>
          Define the behavior of the agentic AI. These settings control how the AI interacts with learners.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="emotionalTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emotional Tone</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="font-code" />
                  </FormControl>
                  <FormDescription>Describe the desired emotional tone of the AI (e.g., empathetic, neutral).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleTakingBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role-Taking Behavior</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="font-code" />
                  </FormControl>
                  <FormDescription>Explain how the AI should adopt different roles during conversation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scaffoldingPrompts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scaffolding Prompts</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="font-code" />
                  </FormControl>
                  <FormDescription>Provide examples of prompts the AI can use to help learners who are stuck.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Personality'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
