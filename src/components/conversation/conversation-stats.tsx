'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Clock, BarChart2 } from 'lucide-react';
import type { Message } from '@/lib/types';

interface ConversationStatsProps {
  messages: Message[];
}

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center gap-4">
    <div className="bg-muted p-2 rounded-lg">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

export function ConversationStats({ messages }: ConversationStatsProps) {
  const stats = useMemo(() => {
    const userMessages = messages.filter(m => !m.isAI);
    const aiMessages = messages.filter(m => m.isAI);

    const userWordCount = userMessages.reduce((acc, msg) => acc + msg.text.split(/\s+/).filter(Boolean).length, 0);

    return {
      totalTurns: messages.length,
      userTurns: userMessages.length,
      aiTurns: aiMessages.length,
      userWordCount,
    };
  }, [messages]);

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Session Stats</CardTitle>
        <CardDescription>Real-time analysis of your conversation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatItem icon={MessageSquare} label="Your Turns" value={stats.userTurns} />
        <StatItem icon={MessageSquare} label="AI Turns" value={stats.aiTurns} />
        <StatItem icon={BarChart2} label="Your Words" value={stats.userWordCount} />
        <StatItem icon={Clock} label="Avg. Fluency (WPM)" value="--" />
        <StatItem icon={BarChart2} label="Lexical Richness" value="--" />
      </CardContent>
    </Card>
  );
}
