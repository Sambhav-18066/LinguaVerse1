'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatLayout, type ChatLayoutRef } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { useToast } from '@/hooks/use-toast';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm your agentic AI partner, Amisha. Let's talk about your recent travel experiences. Where is the most interesting place you've visited?",
    timestamp: Date.now(),
    isAI: true,
    user: { id: 'ai', name: 'Amisha', avatarUrl: '/amisha-avatar.png' },
  },
];

export default function AgenticConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { toast } = useToast();
  const chatLayoutRef = useRef<ChatLayoutRef>(null);

  const handleStartRecording = useCallback(() => {
    chatLayoutRef.current?.startRecording();
  }, []);

  const handleTextToSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsAudioPlaying(true);
      utterance.onend = () => {
        setIsAudioPlaying(false);
        if (!isRecording) {
            handleStartRecording();
        }
      };
      utterance.onerror = () => {
        setIsAudioPlaying(false);
        if (!isRecording) {
          handleStartRecording();
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Browser does not support SpeechSynthesis.');
      toast({
        variant: 'destructive',
        title: 'TTS Not Supported',
        description: 'Your browser does not support the Text-to-Speech feature.',
      });
      if (!isRecording) {
        handleStartRecording();
      }
    }
  }, [toast, isRecording, handleStartRecording]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isAI) {
      handleTextToSpeech(lastMessage.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);


  const handleSendMessage = async (messageText: string, audioBlob?: Blob) => {
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), text: messageText, isAI: false, timestamp: Date.now(), user: { id: 'user', name: 'User', avatarUrl: '' } }];
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
        user: { id: 'ai', name: 'Amisha', avatarUrl: '/amisha-avatar.png' },
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
            <p className="text-muted-foreground">Chat with Amisha, an adaptive AI that provides helpful feedback.</p>
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
    </div>
  );
}
