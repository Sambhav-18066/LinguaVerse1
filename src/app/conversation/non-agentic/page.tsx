'use client';

import { useState, useRef } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { textToSpeech } from '@/ai/flows/text-to-speech';
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
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);


  const handleTextToSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      const { audioDataUri } = await textToSpeech({ text });
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate speech. You may have exceeded your API quota.',
      });
      setIsPlaying(false);
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

  const handleAudioPlayback = (audio: HTMLAudioElement) => {
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
            variant: 'destructive',
            title: 'Audio Playback Error',
            description: 'Could not play the generated audio.',
        });
      };
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
            isAudioPlaying={isPlaying}
            onPlayAudio={handleTextToSpeech}
        />
        <audio ref={el => {
            if (el && !audioRef.current) {
                audioRef.current = el;
                handleAudioPlayback(el);
            }
        }} className="hidden" />
    </div>
  );
}
