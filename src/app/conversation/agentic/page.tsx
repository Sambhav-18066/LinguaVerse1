'use client';

import { useState } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { useToast } from '@/hooks/use-toast';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm your agentic AI partner. Let's talk about your recent travel experiences. Where is the most interesting place you've visited?",
    timestamp: Date.now(),
    isAI: true,
    user: { id: 'ai', name: 'LinguaVerse AI', avatarUrl: '' },
  },
];

export default function AgenticConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (messageText: string) => {
    setIsLoading(true);
    try {
      const feedbackResponse = await generatePersonalizedFeedback({ spokenText: messageText });
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: feedbackResponse.feedback,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'LinguaVerse AI', avatarUrl: '' },
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold font-headline">Agentic AI Conversation</h1>
            <p className="text-muted-foreground">Chat with an adaptive AI that provides helpful feedback.</p>
        </div>
        <ChatLayout
            messages={messages}
            setMessages={setMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
        />
    </div>
  );
}
