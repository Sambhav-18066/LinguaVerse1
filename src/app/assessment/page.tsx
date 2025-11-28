'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatLayout, type ChatLayoutRef } from '@/components/conversation/chat-layout';
import { AssessmentResults } from '@/components/assessment/assessment-results';
import { TopicSelector } from '@/components/assessment/topic-selector';
import type { Message, SpeakingAssessmentResult } from '@/lib/types';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { generateConversationTopics } from '@/ai/flows/generate-conversation-topics';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTextToSpeech } from '@/ai/flows/generate-text-to-speech';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AssessmentPage() {
  const [assessmentResult, setAssessmentResult] = useState<SpeakingAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);

  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatLayoutRef = useRef<ChatLayoutRef>(null);
  const { toast } = useToast();
  const amishaAvatar = PlaceHolderImages.find(p => p.id === 'amisha-avatar');


  const handleStartRecording = useCallback(() => {
    chatLayoutRef.current?.startRecording();
  }, []);

  const handleTextToSpeech = useCallback(async (text: string, muted: boolean) => {
    if (muted) {
      if (!isRecording) handleStartRecording();
      return;
    }
    
    try {
      const { audioDataUri } = await generateTextToSpeech({ text });
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

    // Initial message on conversation start
    if (messages.length === 1 && messages[0].isAI && conversationStarted) {
      handleTextToSpeech(messages[0].text, isAiMuted);
    }
  
    return () => {
      audioEl.removeEventListener('play', onPlay);
      audioEl.removeEventListener('ended', onEnded);
      audioEl.removeEventListener('error', onError);
    };
  }, [toast, isRecording, handleStartRecording, messages, conversationStarted, handleTextToSpeech, isAiMuted]);

  const handleStartConversation = async (topic: string) => {
    setSelectedTopic(topic);
    const initialText = `Let's talk about ${topic}. What are your initial thoughts?`;
    const firstMessage = {
        id: '1',
        text: initialText,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: amishaAvatar?.imageUrl },
      };

    setMessages([firstMessage]);
    setConversationStarted(true);
    setAssessmentResult(null);
    audioChunksRef.current = [];
    // The useEffect above will handle playing the TTS for this first message
  };

  const handleSendMessage = async (messageText: string, audioBlob?: Blob) => {
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), text: messageText, isAI: false, timestamp: Date.now(), user: { id: 'user', name: 'User' } }];
    setMessages(newMessages);

    if (audioBlob) {
      audioChunksRef.current.push(audioBlob);
    }
    try {
      const feedbackResponse = await generatePersonalizedFeedback({ 
        history: messages,
        spokenText: messageText, 
        feedbackRequest: `Keep the conversation going about the topic: "${selectedTopic}". Ask a follow-up question related to it.`
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

  const handleFinishAndAnalyze = async () => {
    if (audioChunksRef.current.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Speech Recorded',
        description: 'You need to speak at least once to get an assessment.',
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Combine all audio chunks into a single Blob
    const combinedAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    const reader = new FileReader();
    reader.readAsDataURL(combinedAudioBlob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const result = await assessSpeakingSkills({ speechDataUri: base64data });
        const finalResult: SpeakingAssessmentResult = {
          id: new Date().toISOString(),
          userId: '1',
          date: Date.now(),
          ...result
        };
        setAssessmentResult(finalResult);
      } catch (error) {
        console.error('Failed to assess speaking skills', error);
        toast({
          variant: 'destructive',
          title: 'Assessment Failed',
          description: 'There was an error processing your speech. Please try again.',
        });
      } finally {
        setIsAnalyzing(false);
        setConversationStarted(false);
      }
    };
  };

  const handleRetake = () => {
    setAssessmentResult(null);
    setConversationStarted(false);
    setMessages([]);
    audioChunksRef.current = [];
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

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <FileText className="w-12 h-12 text-primary animate-pulse mb-4" />
        <h2 className="text-2xl font-bold">Analyzing your conversation...</h2>
        <p className="text-muted-foreground">This may take a moment. We're calculating your final scores.</p>
      </div>
    );
  }

  if (assessmentResult) {
    return <AssessmentResults result={assessmentResult} onRetake={handleRetake} />;
  }

  if (conversationStarted) {
    return (
      <div className="flex flex-col h-full">
         <div className="flex justify-between items-center text-center mb-4">
            <div className="flex-1">
                <h1 className="text-3xl font-bold font-headline">Conversational Assessment</h1>
                <p className="text-muted-foreground">Have a conversation with the AI. Click "Finish & Analyze" when you're done.</p>
            </div>
            <Button onClick={handleToggleMute} variant="outline" size="icon">
              {isAiMuted ? <VolumeX /> : <Volume2 />}
            </Button>
        </div>
        <div className="flex-grow">
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
        <div className="flex justify-center py-4">
          <Button onClick={handleFinishAndAnalyze} size="lg" disabled={isLoading}>
            <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : 'hidden'}`} />
            Finish & Analyze Session
          </Button>
        </div>
        <audio ref={audioRef} className="hidden" />
      </div>
    );
  }

  return <TopicSelector onTopicSelect={handleStartConversation} />;
}
