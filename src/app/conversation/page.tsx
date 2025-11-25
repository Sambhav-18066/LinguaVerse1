import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Bot, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const modes = [
  {
    title: 'Agentic AI',
    description: 'Practice with an empathetic AI that guides the conversation and provides feedback.',
    href: '/conversation/agentic',
    icon: BrainCircuit,
    imageId: 'agentic-ai-mode'
  },
  {
    title: 'Non-Agentic AI',
    description: 'A reactive AI for straightforward practice without emotional or adaptive behavior.',
    href: '/conversation/non-agentic',
    icon: Bot,
    imageId: 'non-agentic-ai-mode'
  },
  {
    title: 'Peer-to-Peer',
    description: 'Chat with another learner to practice in a real-world scenario.',
    href: '/conversation/peer',
    icon: Users,
    imageId: 'peer-to-peer-mode'
  },
];

export default function ConversationModesPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Choose Your Practice Mode</h1>
        <p className="mt-4 text-lg text-muted-foreground">Select how you want to improve your English speaking skills today.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {modes.map((mode) => {
          const image = PlaceHolderImages.find(img => img.id === mode.imageId);
          return (
            <Card key={mode.title} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex-row gap-4 items-center">
                <mode.icon className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{mode.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                {image && (
                  <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
                    <Image src={image.imageUrl} alt={image.description} fill={true} objectFit="cover" data-ai-hint={image.imageHint} />
                  </div>
                )}
                <CardDescription className="flex-grow">{mode.description}</CardDescription>
                <Button asChild className="mt-4 w-full">
                  <Link href={mode.href}>Start Practicing <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
