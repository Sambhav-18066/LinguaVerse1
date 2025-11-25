'use client';
import { type ForwardedRef, useImperativeHandle, forwardRef, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatInput, type ChatInputRef } from './chat-input';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { ConversationStats } from './conversation-stats';

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
        <Card className="lg:col-span-2 w-full mx-auto flex flex-col shadow-2xl rounded-xl bg-card/80 backdrop-blur-sm">
        <div className="flex-grow overflow-hidden flex flex-col items-center justify-center p-6 space-y-4 relative">
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
                    "border-transparent",
                    isAiTurn && "border-primary",
                    isRecording && !isAudioPlaying && "border-destructive animate-pulse"
                )}>
                    <AvatarImage src={isAiTurn ? aiAvatarUrl : ''} />
                    <AvatarFallback className="text-muted-foreground bg-transparent">
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
        <div className="border-t border-border/20 p-4 rounded-b-xl">
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
        <div className="hidden lg:block">
            <ConversationStats messages={messages} />
        </div>
    </div>
  );
});

ChatLayout.displayName = "ChatLayout";
