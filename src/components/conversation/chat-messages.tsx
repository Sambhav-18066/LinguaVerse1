'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Bot, User, Volume2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isAudioPlaying?: boolean;
  onPlayAudio?: (text: string) => void;
  voiceOnly?: boolean;
}

export function ChatMessages({ messages, isLoading, isAudioPlaying, onPlayAudio, voiceOnly = false }: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => {
        if (voiceOnly && message.isAI) {
          return null; // Don't render AI messages in voiceOnly mode
        }
        return (
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
                'max-w-md rounded-xl px-4 py-3 text-sm shadow-md flex items-center gap-2',
                message.isAI
                  ? 'bg-card rounded-tl-none'
                  : 'bg-primary text-primary-foreground rounded-br-none'
              )}
            >
              <p>{message.text}</p>
              {message.isAI && onPlayAudio && (
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => onPlayAudio(message.text)}
                    disabled={isAudioPlaying}
                >
                    <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {!message.isAI && (
              <Avatar className="h-8 w-8 border">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
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
