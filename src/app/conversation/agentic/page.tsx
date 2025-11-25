'use client';

import { useState, useRef } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { textToSpeech } from '@/ai/flows/text-to-speech';
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
            <h1 className="text-3xl font-bold font-headline">Agentic AI Conversation</h1>
            <p className="text-muted-foreground">Chat with an adaptive AI that provides helpful feedback.</p>
        </div>
        <ChatLayout
            messages={messages}
            setMessages={setMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isAudioPlaying={isPlaying}
            onPlayAudio={handleTextToSpeech}
            voiceOnly={true}
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
