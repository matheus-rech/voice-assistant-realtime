# Advanced Real-Time Voice Assistant

A real-time voice assistant application with screen sharing capabilities, streaming responses, and context awareness, built with Next.js, LiveKit, and OpenAI.

## Features

### Real-time Interaction
- **Streaming Responses:** See AI responses as they're being generated in real-time
- **Interruption Support:** Cancel responses mid-generation
- **Adaptive Speech Recognition:** Optimized for natural conversation flow

### Visual Context Awareness
- **Screen Sharing Integration:** Assistant can see and reference content on shared screens
- **Camera Support:** Visual context awareness when camera is enabled
- **Contextual Understanding:** Responses adapt based on visual context

### Enhanced User Experience
- **Typing Indicators:** Visual feedback when the assistant is processing
- **Customizable Voice:** Options for text-to-speech synthesis
- **Context Management:** Maintains conversational history for more coherent interactions

### Additional Features
- **Room Management:** Create and manage LiveKit rooms
- **Webhook Support:** Handle LiveKit events
- **Error Handling:** Robust error detection and recovery

## Technical Implementation

### Key Components
- **EnhancedVoiceAssistant:** Core component with real-time capabilities
- **ConversationDisplay:** Display component with streaming response support
- **ContextManager:** Manages conversational and visual context

### Architecture
- **Web Speech API:** For speech recognition and synthesis
- **OpenAI Real-time API:** Latest streaming API for real-time text generation
- **LiveKit Integration:** For video/audio/screen sharing capabilities

### API Implementation
- **Streaming Text Generation:** Uses OpenAI's latest real-time APIs with message-based format
- **LiveKit Agent Integration:** Configured with latest modalities format (audio, vision, text)
- **Context Management:** Maintains conversational history in messages array format

## Deployment on Vercel

### Prerequisites

- A Vercel account
- A LiveKit account (Cloud or self-hosted)
- An OpenAI API key

### Environment Variables

Set up the following environment variables in your Vercel project:

- `NEXT_PUBLIC_LIVEKIT_URL`: Your LiveKit server URL (e.g., wss://your-project.livekit.cloud)
- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret
- `OPENAI_API_KEY`: Your OpenAI API key

### Deployment Steps

1. Fork or clone this repository
2. Link it to your Vercel account
3. Set up the environment variables
4. Deploy with the following command:

```bash
vercel --prod
```

## Local Development

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to use the application.

### Running the LiveKit Voice Agent

The application can run a LiveKit voice agent that provides real-time voice interaction with screen sharing awareness. To use this feature:

1. Install required LiveKit agent dependencies:

```bash
# Install required agent dependencies
node scripts/install-agent-deps.js
```

2. Set up your environment variables in a `.env.local` file:

```
NEXT_PUBLIC_LIVEKIT_URL=your-livekit-url
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_LIVEKIT_ROOM=default-room-name
```

3. Start the agent using one of these methods:

   a. Using the web interface:
      - Start the development server with `pnpm dev`
      - Navigate to the application in your browser
      - Click the "Start AI Agent" button

   b. Using the command line:
      - Run `node scripts/run-agent.js [room-name]`
      - This will start the agent directly without needing to use the UI

4. Check agent status:
   - In the web UI, click "Refresh Status" button
   - Or make a GET request to `/api/agent-status?room=[room-name]`

5. Troubleshooting:
   - If the agent isn't responding, check the browser console for errors
   - Make sure all required dependencies are installed
   - Verify that your environment variables are correctly set
   - Check that the agent process started successfully

6. To use the agent:
   - Enable your microphone and camera if desired
   - Enable screen sharing if desired
   - Speak to the agent and it will respond with real-time, context-aware responses
   - The agent can see your screen (if shared) and respond accordingly

### Build Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build production-ready application
- `pnpm start` - Run production build locally
- `pnpm lint` - Run ESLint to check for code issues

## Future Enhancements

- Voice emotion detection for more natural responses
- User preferences for voice assistant behavior
- Multi-user conversation support
- Local transcription for improved privacy
- Mobile optimization with responsive design