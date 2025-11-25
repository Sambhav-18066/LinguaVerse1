'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatLayout, type ChatLayoutRef } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hey! I'm another learner, just like you. Let's practice together. What do you want to talk about?",
    timestamp: Date.now(),
    isAI: true, // For styling purposes, the 'peer' is treated as the other party in the chat
    user: { id: 'peer', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/2/100/100' },
  },
];

export default function PeerConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const {toast} = useToast();
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


  // Simulate a peer's response using the AI
  const handleSendMessage = async (messageText: string) => {
    setIsLoading(true);
    
    try {
      const peerResponseText = await generatePersonalizedFeedback({
        spokenText: messageText,
        feedbackRequest: "Respond as 'Alex', another English language learner. Keep your response casual, friendly, and short. Ask a follow-up question."
      });

      const peerResponse: Message = {
        id: Date.now().toString(),
        text: peerResponseText.feedback,
        timestamp: Date.now(),
        isAI: true, // treat as 'other' for styling
        user: { id: 'peer', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/2/100/100' },
      };
      
      setMessages((prev) => [...prev, peerResponse]);

    } catch (error) {
       console.error('Error generating peer response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI peer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold font-headline">Peer-to-Peer Chat</h1>
            <p className="text-muted-foreground">Practice your English with another learner.</p>
        </div>
        <ChatLayout
            ref={chatLayoutRef}
            messages={messages}
            setMessages={setMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
            isAudioPlaying={isAudioPlaying}
        />
    </div>
  );
}
