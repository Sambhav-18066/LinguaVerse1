'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isAudioPlaying?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isAudioPlaying }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            handleSend(finalTranscript);
        }
      };
      
      recognition.onend = () => {
        if (isRecording) { // Auto-restart if still in recording state
            recognition.start();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      }

      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Stop recognition when AI is speaking
    if(isAudioPlaying && isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    }
  }, [isAudioPlaying, isRecording]);


  const handleRecord = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    };

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setMessage('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = (text?: string) => {
    const textToSend = text || message;
    if (textToSend.trim()) {
      onSendMessage(textToSend);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleRecord}
        className={cn(
          "h-10 w-10 flex-shrink-0",
          isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        )}
        disabled={isLoading || isAudioPlaying}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
      </Button>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message or use the mic..."
        className="min-h-0 resize-none"
        rows={1}
        disabled={isLoading}
      />
      <Button onClick={() => handleSend()} disabled={isLoading || !message.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}
