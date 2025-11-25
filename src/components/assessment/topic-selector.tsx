'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateConversationTopics } from '@/ai/flows/generate-conversation-topics';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
}

export function TopicSelector({ onTopicSelect }: TopicSelectorProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const { topics: fetchedTopics } = await generateConversationTopics({
          interests: 'technology, travel, food, movies, personal growth',
          proficiencyLevel: 'Intermediate',
        });
        setTopics(fetchedTopics);
        if (fetchedTopics.length > 0) {
          setSelectedTopic(fetchedTopics[0]);
        }
      } catch (error) {
        console.error("Failed to fetch topics", error);
        // Fallback topics
        setTopics(['Technology', 'Travel', 'Food']);
        setSelectedTopic('Technology');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopics();
  }, []);

  const handleStart = () => {
    if (selectedTopic) {
      onTopicSelect(selectedTopic);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Conversational Assessment</CardTitle>
          <CardDescription>
            Have a natural conversation with our AI to assess your speaking skills. First, choose a topic to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic, index) => (
                  <SelectItem key={index} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="lg" onClick={handleStart} disabled={isLoading || !selectedTopic}>
            Start Conversation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
