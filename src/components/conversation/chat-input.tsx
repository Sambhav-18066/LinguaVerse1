'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string, audioBlob?: Blob) => void;
  isLoading: boolean;
  isAudioPlaying?: boolean;
  voiceOnly?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isAudioPlaying, voiceOnly = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
           if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setMessage(finalTranscript + interimTranscript);
        if (finalTranscript) {
            stopRecording(finalTranscript);
        }
      };
      
      recognition.onend = () => {
        if (isRecording) {
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
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Stop recognition when AI is speaking
    if(isAudioPlaying && isRecording) {
      stopRecording(message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying]);


  const startRecording = async () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    };
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
        }

        mediaRecorder.start();
        recognitionRef.current.start();
        setIsRecording(true);
        setMessage('');
        audioChunksRef.current = [];

    } catch (err) {
        console.error("Error starting recording:", err);
    }
  };

  const stopRecording = (finalTranscript: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (finalTranscript.trim()) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSendMessage(finalTranscript, audioBlob);
      setMessage('');
    }
  };

  const handleToggleRecord = () => {
      if (isRecording) {
        stopRecording(message);
      } else {
        startRecording();
      }
  };

  const handleSendText = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };
  
  return (
    <div className={cn("flex items-center gap-2", voiceOnly && "justify-center")}>
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleRecord}
        className={cn(
          "h-10 w-10 flex-shrink-0",
          isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          voiceOnly && "h-16 w-16 rounded-full"
        )}
        disabled={isLoading || isAudioPlaying}
      >
        {isRecording ? <Square className={cn(voiceOnly && "h-6 w-6")} /> : <Mic className={cn(voiceOnly && "h-6 w-6")} />}
        <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
      </Button>
      {!voiceOnly && (
        <>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Type your message or use the mic..."}
            className="min-h-0 resize-none"
            rows={1}
            disabled={isLoading || isRecording}
          />
          <Button onClick={handleSendText} disabled={isLoading || isRecording || !message.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </>
      )}
    </div>
  );
}
