'use client';

import { useState } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import type { Message } from '@/lib/types';

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hey! I'm another learner, just like you. Let's practice together. What do you want to talk about?",
    timestamp: Date.now(),
    isAI: true, // For styling purposes, the 'peer' is treated as the other party in the chat
    user: { id: 'peer', name: 'Alex', avatarUrl: '' },
  },
];

export default function PeerConversationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Mock peer response
  const handleSendMessage = async (messageText: string) => {
    setIsLoading(true);
    
    // Simulate network delay and peer typing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const peerResponse: Message = {
      id: Date.now().toString(),
      text: `That's interesting! Tell me more about that. (This is a mock response, in a real app another user would reply)`,
      timestamp: Date.now(),
      isAI: true, // treat as 'other' for styling
      user: { id: 'peer', name: 'Alex', avatarUrl: '' },
    };
    setMessages((prev) => [...prev, peerResponse]);

    setIsLoading(false);
  };

  return (
    <div>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold font-headline">Peer-to-Peer Chat</h1>
            <p className="text-muted-foreground">Practice your English with another learner.</p>
        </div>
        <ChatLayout
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
