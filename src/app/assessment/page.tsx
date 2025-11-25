'use client';

import { useState, useRef } from 'react';
import { ChatLayout } from '@/components/conversation/chat-layout';
import { AssessmentResults } from '@/components/assessment/assessment-results';
import { TopicSelector } from '@/components/assessment/topic-selector';
import type { Message, SpeakingAssessmentResult } from '@/lib/types';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { generateConversationTopics } from '@/ai/flows/generate-conversation-topics';
import { generatePersonalizedFeedback } from '@/ai/flows/generate-personalized-feedback';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssessmentPage() {
  const [assessmentResult, setAssessmentResult] = useState<SpeakingAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartConversation = (topic: string) => {
    setSelectedTopic(topic);
    setMessages([
      {
        id: '1',
        text: `Great! Let's talk about ${topic}. Tell me something about it.`,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: '' },
      },
    ]);
    setConversationStarted(true);
    setAssessmentResult(null);
    audioChunksRef.current = [];
  };

  const handleSendMessage = async (messageText: string, audioBlob?: Blob) => {
    setIsLoading(true);
    if (audioBlob) {
      audioChunksRef.current.push(audioBlob);
    }
    try {
      const feedbackResponse = await generatePersonalizedFeedback({ 
        spokenText: messageText, 
        feedbackRequest: `Keep the conversation going about the topic: "${selectedTopic}". Ask a follow-up question related to it.`
      });
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: feedbackResponse.feedback,
        timestamp: Date.now(),
        isAI: true,
        user: { id: 'ai', name: 'Amisha', avatarUrl: '' },
      };
      setMessages((prev) => [...prev, aiResponse]);
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
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold font-headline">Conversational Assessment</h1>
          <p className="text-muted-foreground">Have a conversation with the AI. Click "Finish & Analyze" when you're done.</p>
        </div>
        <div className="flex-grow">
           <ChatLayout
              messages={messages}
              setMessages={setMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
          />
        </div>
        <div className="flex justify-center py-4">
          <Button onClick={handleFinishAndAnalyze} size="lg" disabled={isLoading}>
            <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : 'hidden'}`} />
            Finish & Analyze Session
          </Button>
        </div>
      </div>
    );
  }

  return <TopicSelector onTopicSelect={handleStartConversation} />;
}
