import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, MessageCircle, FileText, Bot, Users, BrainCircuit } from 'lucide-react';

export default function HowToUsePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">How to Use LinguaVerse</h1>
        <p className="mt-4 text-lg text-muted-foreground">Your guide to mastering English speaking skills with our AI-powered platform.</p>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <span>Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>The <strong>Dashboard</strong> is your personal command center. Here you can:</p>
            <ul className="list-disc list-inside pl-4">
              <li>Track your <strong>Total Sessions</strong> and <strong>Total Practice Time</strong>.</li>
              <li>Monitor your progress on <strong>Average Fluency (Words Per Minute)</strong> and <strong>Lexical Richness</strong>.</li>
              <li>View a chart of your progress over time to see how you are improving.</li>
              <li>See a list of your <strong>Recent Sessions</strong> for quick access.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>Conversation Modes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>Practice makes perfect! Choose from three different conversation modes to hone your skills:</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="h-5 w-5" /> Agentic AI</h3>
                <p className="text-sm">Engage with an intelligent AI partner that guides the conversation, adapts to your level, and provides empathetic feedback to help you improve.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2"><Bot className="h-5 w-5" /> Non-Agentic AI</h3>
                <p className="text-sm">Use this mode for straightforward, reactive practice. The AI will respond directly to what you say without leading the conversation.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Peer-to-Peer</h3>
                <p className="text-sm">Practice your conversation skills by chatting with another learner in a simulated real-world scenario.</p>
              </div>
            </div>
            <p>In all modes, you can use your microphone to speak or type your message.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Speaking Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>Take a short test to get a detailed evaluation of your speaking abilities. The assessment measures several key metrics from the "Speaking-of-Self" rubric:</p>
            <ul className="list-disc list-inside pl-4">
                <li><strong>Fluency:</strong> The rate and smoothness of your speech.</li>
                <li><strong>Lexical Richness:</strong> The variety of your vocabulary.</li>
                <li><strong>Reflective Turns:</strong> Your ability to reflect and elaborate.</li>
                <li><strong>Autobiographical Depth:</strong> The depth of personal experience you share.</li>
                <li><strong>Conversation Initiative:</strong> Your proactiveness in conversation.</li>
                <li><strong>Narrative Continuity:</strong> How well you maintain a coherent story.</li>
            </ul>
            <p className="mt-2">Record yourself speaking, and our AI will analyze it to provide your scores. You can retake the assessment at any time to track your improvement.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
