'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatLayout, type ChatLayoutRef } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { useToast } from '@/hooks/use-toast';
import { generateTextToSpeech } from '@/ai/flows/generate-text-to-speech';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const amishaAvatar = PlaceHolderImages.find(p => p.id === 'amisha-avatar');

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm your agentic AI partner, Amisha. Let's talk about your recent travel experiences. Where is the most interesting place you've visited?",
    timestamp: Date.now(),
    isAI: true,
    user: { id: 'ai', name: 'Amisha', avatarUrl: amishaAvatar?.imageUrl },
  },
];

export default function AgenticConversationPage() {
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

  const handleTextToSpeech = useCallback(async (text: string, muted: boolean) => {
    if (muted) {
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
  }, [isRecording, handleStartRecording, toast]);
  
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
      handleTextToSpeech(messages[0].text, isAiMuted);
    }
  
    return () => {
      audioEl.removeEventListener('play', onPlay);
      audioEl.removeEventListener('ended', onEnded);
      audioEl.removeEventListener('error', onError);
    };
  }, [toast, isRecording, handleStartRecording, messages, handleTextToSpeech, isAiMuted]);

  const handleSendMessage = async (messageText: string, audioBlob?: Blob) => {
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), text: messageText, isAI: false, timestamp: Date.now(), user: { id: 'user', name: 'User' } }];
    setMessages(newMessages);

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
        history: messages,
        spokenText: messageText,
        assessment: assessmentResult
      });
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: feedbackResponse.feedback,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: amishaAvatar?.imageUrl },
      };
      setMessages((prev) => [...prev, aiResponse]);
      await handleTextToSpeech(aiResponse.text, isAiMuted);

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

  const handleToggleMute = () => {
    const newMutedState = !isAiMuted;
    setIsAiMuted(newMutedState);
    if (newMutedState && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsAudioPlaying(false);
        if (!isRecording) {
            handleStartRecording();
        }
    }
  }
  
  return (
    <div>
        <div className="flex justify-between items-center text-center mb-6">
          <div className='flex-1'>
            <h1 className="text-3xl font-bold font-headline">Agentic AI Conversation</h1>
            <p className="text-muted-foreground">Chat with Amisha, an adaptive AI that provides helpful feedback.</p>
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
