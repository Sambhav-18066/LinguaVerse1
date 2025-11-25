'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatLayout, type ChatLayoutRef } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { useToast } from '@/hooks/use-toast';
import { generateTextToSpeech } from '@/ai/flows/generate-text-to-speech';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Ready to begin.",
    timestamp: Date.now(),
    isAI: true,
    user: { id: 'ai', name: 'Amisha', avatarUrl: '/amisha-avatar.png' },
  },
];

export default function NonAgenticConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);

  const { toast } = useToast();
  const chatLayoutRef = useRef<ChatLayoutRef>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartRecording = useCallback(() => {
    chatLayoutRef.current?.startRecording();
  }, []);

  const handleTextToSpeech = useCallback(async (text: string) => {
    if (isAiMuted) {
      if (!isRecording) handleStartRecording();
      return;
    }

    try {
      const { audioDataUri } = await generateTextToSpeech({text});
      if (audioDataUri && audioRef.current) {
        audioRef.current.src = audioDataUri;
        await audioRef.current.play();
      } else {
        if (!isRecording) handleStartRecording();
      }
    } catch (error) {
      console.error("Error generating or playing TTS:", error);
      toast({
        variant: 'destructive',
        title: 'Text-to-Speech Error',
        description: 'Could not play AI audio response.',
      });
      if (!isRecording) handleStartRecording();
    }
  }, [isAiMuted, isRecording, handleStartRecording, toast]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
  
    const onPlay = () => setIsAudioPlaying(true);
    const onEnded = () => {
      setIsAudioPlaying(false);
      if (!isRecording) {
        handleStartRecording();
      }
    };
    const onError = () => {
      setIsAudioPlaying(false);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'There was an error playing the audio.',
      });
      if (!isRecording) {
        handleStartRecording();
      }
    };
  
    audioEl.addEventListener('play', onPlay);
    audioEl.addEventListener('ended', onEnded);
    audioEl.addEventListener('error', onError);
  
    // Initial message
    if (messages.length === 1 && messages[0].isAI) {
      handleTextToSpeech(messages[0].text);
    }
  
    return () => {
      audioEl.removeEventListener('play', onPlay);
      audioEl.removeEventListener('ended', onEnded);
      audioEl.removeEventListener('error', onError);
    };
  }, [toast, isRecording, handleStartRecording, messages, handleTextToSpeech]);

  
  const handleSendMessage = async (messageText: string) => {
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), text: messageText, isAI: false, timestamp: Date.now(), user: { id: 'user', name: 'User', avatarUrl: '' } }];
    setMessages(newMessages);

    try {
      // NOTE: For a true non-agentic mode, a different, more direct prompt/flow would be used.
      // Here we simulate it by providing a more direct response.
      const feedbackResponse = await generatePersonalizedFeedback({ 
        history: messages,
        spokenText: messageText, 
        feedbackRequest: "Provide a direct response." 
      });
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: feedbackResponse.feedback,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: '/amisha-avatar.png' },
      };
      setMessages((prev) => [...prev, aiResponse]);
      await handleTextToSpeech(aiResponse.text);

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

  const handleToggleMute = () => {
    setIsAiMuted(prev => {
      if (!prev && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsAudioPlaying(false);
        if (!isRecording) {
            handleStartRecording();
        }
      }
      return !prev;
    });
  }

  return (
    <div>
        <div className="flex justify-between items-center text-center mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-headline">Non-Agentic AI Conversation</h1>
              <p className="text-muted-foreground">Practice with a purely reactive AI.</p>
            </div>
            <Button onClick={handleToggleMute} variant="outline" size="icon">
              {isAiMuted ? <VolumeX /> : <Volume2 />}
            </Button>
        </div>
        <ChatLayout
            ref={chatLayoutRef}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
            isAudioPlaying={isAudioPlaying}
        />
        <audio ref={audioRef} className="hidden" />
    </div>
  );
}
