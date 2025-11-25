export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: number;
  user: User;
  isAI: boolean;
};

export type ConversationSession = {
  id: string;
  mode: 'Agentic AI' | 'Non-Agentic AI' | 'Peer-to-Peer';
  startTime: number;
  endTime: number;
  participants: User[];
  summary: string;
};

export type SpeakingAssessmentResult = {
  id: string;
  userId: string;
  date: number;
  fluency: number;
  lexicalRichness: number;
  reflectiveTurns: number;
  autobiographicalDepth: number;
  conversationInitiative: number;
  narrativeContinuity: number;
};
