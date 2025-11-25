'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { useToast } from '@/hooks/use-toast';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm your agentic AI partner. Let's talk about your recent travel experiences. Where is the most interesting place you've visited?",
    timestamp: Date.now(),
    isAI: true,
    user: { id: 'ai', name: 'Amisha', avatarUrl: '' },
  },
];

export default function AgenticConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
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
      // Stop any currently speaking synthesis
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Optionally, you can configure the voice, rate, pitch, etc.
      // const voices = window.speechSynthesis.getVoices();
      // utterance.voice = voices.find(v => v.name === 'Google US English') || voices[0];
      utterance.rate = 1;
      utterance.pitch = 1;
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

  const handleSendMessage = async (messageText: string, audioBlob?: Blob) => {
    setIsLoading(true);
    try {
      let assessmentResult;
      if (audioBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        await new Promise<void>((resolve) => {
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                try {
                    assessmentResult = await assessSpeakingSkills({ speechDataUri: base64data });
                } catch (e) {
                    console.error("Could not assess skills from audio", e);
                } finally {
                    resolve();
                }
            };
        });
      }

      const feedbackResponse = await generatePersonalizedFeedback({ 
        spokenText: messageText,
        assessment: assessmentResult
      });
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: feedbackResponse.feedback,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: '' },
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
