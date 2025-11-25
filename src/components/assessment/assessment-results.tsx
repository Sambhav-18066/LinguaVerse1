import type { SpeakingAssessmentResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Repeat } from 'lucide-react';

interface AssessmentResultsProps {
  result: SpeakingAssessmentResult;
  onRetake: () => void;
}

const metrics = [
    { key: 'fluency', label: 'Fluency (WPM)', max: 150 },
    { key: 'lexicalRichness', label: 'Lexical Richness', max: 10 },
    { key: 'reflectiveTurns', label: 'Reflective Turns', max: 10 },
    { key: 'autobiographicalDepth', label: 'Autobiographical Depth', max: 10 },
    { key: 'conversationInitiative', label: 'Conversation Initiative', max: 10 },
    { key: 'narrativeContinuity', label: 'Narrative Continuity', max: 10 },
];

export function AssessmentResults({ result, onRetake }: AssessmentResultsProps) {
    
  const getProgressValue = (value: number, max: number) => {
    // Handle cases where value might be null or undefined, default to 0
    const numericValue = typeof value === 'number' ? value : 0;
    return (numericValue / max) * 100;
  };
    
  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-3 w-fit mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          <CardTitle className="text-3xl font-headline">Assessment Complete</CardTitle>
          <CardDescription>Here are your scores based on your conversation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map(({ key, label, max }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-lg font-bold text-primary">{(result[key as keyof SpeakingAssessmentResult] as number) || 0}</p>
              </div>
              <Progress value={getProgressValue(result[key as keyof SpeakingAssessmentResult] as number, max)} />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={onRetake} className="w-full" variant="outline">
            <Repeat className="mr-2 h-4 w-4" />
            Take New Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
