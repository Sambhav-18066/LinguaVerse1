'use client';
import { type ForwardedRef, useImperativeHandle, forwardRef, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatInput, type ChatInputRef } from './chat-input';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatLayoutProps {
  messages: Message[];
  onSendMessage: (message: string, audioBlob?: Blob) => Promise<void>;
  isLoading: boolean;
  isRecording: boolean;
  onRecordingChange: (isRecording: boolean) => void;
  isAudioPlaying: boolean;
}

export interface ChatLayoutRef {
  startRecording: () => void;
}

export const ChatLayout = forwardRef<ChatLayoutRef, ChatLayoutProps>(
  ({ messages, onSendMessage, isLoading, isRecording, onRecordingChange, isAudioPlaying }, ref) => {
  
  const chatInputRef = useRef<ChatInputRef>(null);

  useImperativeHandle(ref, () => ({
    startRecording: () => {
      chatInputRef.current?.startRecording();
    }
  }));

  const lastMessage = messages[messages.length - 1];
  const isAiTurn = lastMessage?.isAI || isLoading;
  const aiAvatarUrl = lastMessage?.user?.avatarUrl;
  const aiName = lastMessage?.user?.name || "AI";

  return (
    <Card className="h-[calc(100vh-12rem)] w-full max-w-4xl mx-auto flex flex-col shadow-2xl rounded-xl">
      <div className="flex-grow overflow-hidden flex flex-col items-center justify-center p-6 space-y-4 relative bg-background/80">
        <AnimatePresence>
            <motion.div
              key={isAiTurn ? 'ai' : 'user'}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center gap-4"
            >
              <Avatar className={cn(
                "h-24 w-24 border-4 transition-all duration-300",
                isAiTurn && "border-primary",
                isRecording && "border-destructive animate-pulse"
              )}>
                <AvatarImage src={isAiTurn ? aiAvatarUrl : ''} />
                <AvatarFallback className="text-muted-foreground">
                  {isAiTurn ? <Bot className="h-12 w-12" /> : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold font-headline">{isAiTurn ? `${aiName} is speaking...` : "Your turn"}</h2>
              <p className="text-muted-foreground max-w-md">
                {isRecording ? "Listening..." : (isAiTurn ? "Listen to the response." : "Click the microphone to speak.")}
              </p>
            </motion.div>
        </AnimatePresence>
      </div>
      <div className="border-t p-4 bg-background/80 rounded-b-xl">
        <ChatInput 
            ref={chatInputRef}
            onSendMessage={onSendMessage} 
            isLoading={isLoading} 
            isAudioPlaying={isAudioPlaying} 
            voiceOnly={true} 
            isRecording={isRecording}
            onRecordingChange={onRecordingChange} 
        />
      </div>
    </Card>
  );
});

ChatLayout.displayName = "ChatLayout";
