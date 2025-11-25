'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { useToast } from '@/hooks/use-toast';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Ready to begin.",
    timestamp: Date.now(),
    isAI: true,
    user: { id: 'ai', name: 'Amisha', avatarUrl: '' },
  },
];

export default function NonAgenticConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isAI) {
      handleTextToSpeech(lastMessage.text);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setIsAudioPlaying(true);
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Browser does not support SpeechSynthesis.');
      toast({
        variant: 'destructive',
        title: 'TTS Not Supported',
        description: 'Your browser does not support the Text-to-Speech feature.',
      });
    }
  };
  
  const handleSendMessage = async (messageText: string) => {
    setIsLoading(true);
    try {
      // NOTE: For a true non-agentic mode, a different, more direct prompt/flow would be used.
      // Here we simulate it by providing a more direct response.
      const feedbackResponse = await generatePersonalizedFeedback({ spokenText: messageText, feedbackRequest: "Provide a direct response." });
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: feedbackResponse.feedback,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: '' },
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
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
            <h1 className="text-3xl font-bold font-headline">Non-Agentic AI Conversation</h1>
            <p className="text-muted-foreground">Practice with a purely reactive AI.</p>
        </div>
        <ChatLayout
            messages={messages}
            setMessages={setMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isRecording={isRecording}
            isAudioPlaying={isAudioPlaying}
        />
    </div>
  );
}
