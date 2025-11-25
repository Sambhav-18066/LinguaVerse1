'use client';
import type { Dispatch, type SetStateAction } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { Card } from '@/components/ui/card';

interface ChatLayoutProps {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatLayout({ messages, setMessages, onSendMessage, isLoading }: ChatLayoutProps) {
  
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: Date.now(),
      isAI: false,
      user: { id: '1', name: 'User', avatarUrl: 'https://picsum.photos/seed/1/100/100' },
    };

    setMessages((prev) => [...prev, newMessage]);
    await onSendMessage(messageText);
  };

  return (
    <Card className="h-[calc(100vh-12rem)] w-full max-w-4xl mx-auto flex flex-col shadow-2xl rounded-xl">
      <div className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
        <div className="border-t p-4 bg-background/80 rounded-b-xl">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </Card>
  );
}
