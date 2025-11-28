import { config } from 'dotenv';
config();

import '@/ai/flows/configure-ai-personality.ts';
import '@/ai/flows/assess-speaking-skills.ts';
import '@/ai/flows/generate-personalized-feedback.ts';
import '@/ai/flows/generate-conversation-topics.ts';
import '@/ai/flows/generate-text-to-speech.ts';
