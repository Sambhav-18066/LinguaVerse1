# **App Name**: LinguaVerse

## Core Features:

- Agentic AI Conversation: Simulate conversations with an AI agent that initiates topics, shows empathy, and provides personalized feedback. The LLM should act as a tool to help generate contextually appropriate feedback.
- Non-Agentic AI Conversation: Implement a purely reactive AI mode for users seeking unbiased, non-emotional interactions, generating immediate and straightforward responses.
- Peer-to-Peer Chat/Video: Enable simple chat/video interaction between users to simulate a real conversation experience and allow benchmarking and comparisons between users.
- Automated Conversation Logging: Automatically record and save all conversations and associated metadata such as timestamps, user IDs, and AI agent responses in a secure and scalable database.
- Speaking Assessment: Run pre-test and post-test speaking assessments, recording user responses and automatically scoring these based on the Speaking-of-Self rubric using AI.
- Configurable AI Profiles: Allows administrators to configure the AI's emotional tone, role-taking behavior, and scaffolding prompts by loading them via JSON or an admin panel. Changes will modify how the LLM behaves when playing the role of the Agentic AI assistant.
- Metrics Dashboard: Show speaking fluency (words per minute, pauses), lexical richness, reflective turns, autobiographical depth, conversation initiative, and narrative continuity on a dashboard.

## Style Guidelines:

- Primary color: Dark blue (#3F51B5), representing intelligence and conversation.
- Background color: Very light desaturated blue (#E8EAF6), providing a clean and professional base.
- Accent color: Violet (#9575CD), offering a contrasting highlight for interactive elements.
- Body and headline font: 'PT Sans' (sans-serif), providing a balance of warmth and clarity suitable for a professional tool
- Code font: 'Source Code Pro' for configuration files.
- Use consistent and minimalist icons throughout the application to maintain a professional look.
- Use subtle animations when loading AI responses or transitioning between conversation modes.