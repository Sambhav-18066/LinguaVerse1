'use client';

import { useState } from 'react';
import { AssessmentRecorder } from '@/components/assessment/assessment-recorder';
import { AssessmentResults } from '@/components/assessment/assessment-results';
import type { SpeakingAssessmentResult } from '@/lib/types';
import { assessSpeakingSkills } from '@/ai/flows/assess-speaking-skills';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AssessmentPage() {
  const [assessmentResult, setAssessmentResult] = useState<SpeakingAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const { toast } = useToast();

  const handleStartAssessment = () => {
    setAssessmentResult(null);
    setIsAssessing(true);
  };
  
  const handleFinishAssessment = async (audioBlob: Blob) => {
    setIsLoading(true);
    setIsAssessing(false);
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
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
        setIsLoading(false);
      }
    };
  };

  if (isAssessing) {
    return <AssessmentRecorder onFinish={handleFinishAssessment} />;
  }

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <FileText className="w-12 h-12 text-primary animate-pulse mb-4" />
            <h2 className="text-2xl font-bold">Analyzing your speech...</h2>
            <p className="text-muted-foreground">This may take a moment. We're calculating your scores.</p>
        </div>
      )
  }

  if (assessmentResult) {
    return <AssessmentResults result={assessmentResult} onRetake={handleStartAssessment} />;
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Speaking Assessment</CardTitle>
          <CardDescription>Take a short test to evaluate your English speaking skills based on the Speaking-of-Self rubric.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">You will be prompted to speak for about a minute. Please ensure your microphone is enabled.</p>
          <Button size="lg" onClick={handleStartAssessment}>
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
