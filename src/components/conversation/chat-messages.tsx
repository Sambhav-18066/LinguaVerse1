'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Bot, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start gap-4',
            message.isAI ? 'justify-start' : 'justify-end'
          )}
        >
          {message.isAI && (
            <Avatar className="h-8 w-8 border">
              <AvatarFallback>
                <Bot className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              'max-w-md rounded-xl px-4 py-3 text-sm shadow-md',
              message.isAI
                ? 'bg-card rounded-tl-none'
                : 'bg-primary text-primary-foreground rounded-br-none'
            )}
          >
            <p>{message.text}</p>
          </div>
          {!message.isAI && (
            <Avatar className="h-8 w-8 border">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-4 justify-start">
          <Avatar className="h-8 w-8 border">
            <AvatarFallback>
              <Bot className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="max-w-md rounded-xl px-4 py-3 text-sm shadow-md bg-card rounded-tl-none">
            <div className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full animate-bounce delay-0" />
                <Skeleton className="w-2 h-2 rounded-full animate-bounce delay-150" />
                <Skeleton className="w-2 h-2 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
