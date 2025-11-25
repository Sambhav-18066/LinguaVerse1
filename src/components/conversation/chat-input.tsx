'use client';
import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string, audioBlob?: Blob) => void;
  isLoading: boolean;
  isAudioPlaying?: boolean;
  voiceOnly?: boolean;
  isRecording: boolean;
  onRecordingChange: (isRecording: boolean) => void;
}

export interface ChatInputRef {
  startRecording: () => void;
  stopRecording: (transcript: string) => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ onSendMessage, isLoading, isAudioPlaying, voiceOnly = false, isRecording, onRecordingChange }, ref) => {
  const [message, setMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const stopRecording = (finalTranscript: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null; // Prevent race conditions
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    
    onRecordingChange(false);
    
    if (finalTranscript.trim()) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSendMessage(finalTranscript, audioBlob);
      setMessage('');
    }
  };

  const startRecording = async () => {
    if (isRecording || !recognitionRef.current) {
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

        recognitionRef.current.onresult = (event) => {
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

        mediaRecorder.start();
        recognitionRef.current.start();
        onRecordingChange(true);
        setMessage('');
        audioChunksRef.current = [];

    } catch (err) {
        console.error("Error starting recording:", err);
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording
  }));


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onend = () => {
        if (isRecording) {
            // It can stop for various reasons, if we are still in recording mode, restart it.
            recognition.start();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (isRecording) {
            onRecordingChange(false);
        }
      }

      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
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
      <motion.div
        animate={{ scale: isRecording ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleRecord}
          className={cn(
            "h-10 w-10 flex-shrink-0 transition-colors duration-300",
            isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            voiceOnly && "h-20 w-20 rounded-full shadow-lg"
          )}
          disabled={isLoading || isAudioPlaying}
        >
          {isRecording ? <Square className={cn(voiceOnly && "h-8 w-8")} /> : <Mic className={cn(voiceOnly && "h-8 w-8")} />}
          <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
        </Button>
      </motion.div>
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
});

ChatInput.displayName = "ChatInput";
