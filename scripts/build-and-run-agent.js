// This script compiles the TypeScript agent files and then runs the agent
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const projectRoot = path.resolve(__dirname, '..');
const libDir = path.join(projectRoot, 'lib');
const agentTsPath = path.join(libDir, 'livekit-agent.ts');
const agentJsPath = path.join(libDir, 'livekit-agent.js');

// Get room name from command line arguments
const roomName = process.argv[2] || process.env.NEXT_PUBLIC_LIVEKIT_ROOM;

if (!roomName) {
  console.error("Room name is required. Provide it as an argument or set NEXT_PUBLIC_LIVEKIT_ROOM environment variable.");
  process.exit(1);
}

// Load environment variables from .env.local if they don't exist
if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
  try {
    const envPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envPath)) {
      console.log("Loading environment variables from .env.local");
      const envFile = fs.readFileSync(envPath, 'utf8');
      const envVars = envFile.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
      
      for (const line of envVars) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          // Join the rest in case there are equal signs in the value
          const value = parts.slice(1).join('=').trim()
            .replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
          
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not load .env.local file:", err.message);
  }
}

// Verify required environment variables
const requiredEnvVars = [
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "NEXT_PUBLIC_LIVEKIT_URL",
  "OPENAI_API_KEY"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Generate a simple JS loader for the agent
const generateLoader = () => {
  const loaderContent = `
// This file is auto-generated - do not edit directly
const { WorkerOptions, cli } = require("@livekit/agents");
const { JobType } = require("@livekit/protocol");
const path = require("path");

// Configuration
const roomName = "${roomName}";
const livekitUrl = "${process.env.NEXT_PUBLIC_LIVEKIT_URL}";
const apiKey = "${process.env.LIVEKIT_API_KEY}";
const apiSecret = "${process.env.LIVEKIT_API_SECRET}";

// Agent definition
const voiceAssistantAgent = {
  entry: async (ctx) => {
    try {
      // Connect to the room
      await ctx.connect();
      console.log(\`Agent connected to room: \${ctx.room.name}\`);

      // Create a multimodal agent with OpenAI
      const agent = new ctx.multimodal.MultimodalAgent({
        model: new ctx.openai.realtime.RealtimeModel({
          instructions: \`You are a helpful voice assistant that can see the user's screen if they're sharing it.
          
          Your capabilities:
          1. Respond to voice queries in a natural, conversational manner
          2. Provide information and assistance on a wide range of topics
          3. When screen sharing is active, you can reference and discuss what's visible on screen
          4. When camera is enabled, you can see the user and reference this visual context
          5. Maintain context throughout the conversation for a more natural experience
          6. Process and respond to questions in real-time with minimal latency
          
          Guidelines:
          - Keep responses concise and conversational, with a friendly tone
          - Be helpful, engaging, and responsive to user requests
          - If you can see the screen, reference visible content when relevant to show understanding
          - If you can see the user via camera, acknowledge this when contextually appropriate
          - For unclear visual content, describe what you can see and ask for clarification
          - Respond quickly with shorter responses rather than lengthy explanations
          - Use conversational cues like "I see" or "Let me check" to indicate active processing
          - Adapt your responses based on what you can observe about the user's environment\`,

          voice: "nova", // Using nova for a more natural voice
          temperature: 0.7,
          maxResponseOutputTokens: Number.POSITIVE_INFINITY,
          modalities: {
            audio: true,
            vision: true,
            text: true
          },
          turnDetection: {
            type: "server_vad",
            threshold: 0.4,
            silence_duration_ms: 400,
            prefix_padding_ms: 250,
          },
          streaming: {
            enabled: true,
            partial: true,
            chunkSize: 20,
          },
        }),
      });

      // Start the agent in the room
      await agent.start(ctx.room);
      console.log("Agent started successfully with enhanced real-time capabilities");
    } catch (error) {
      console.error("Error starting agent:", error);
      throw error;
    }
  }
};

// Set up logging
console.log(\`Starting agent for room: \${roomName}\`);
console.log(\`Using LiveKit URL: \${livekitUrl}\`);

// Run the agent
cli.runApp(
  new WorkerOptions({
    agent: voiceAssistantAgent,
    workerType: JobType.JT_ROOM,
    roomName: roomName,
    livekit: {
      apiKey: apiKey,
      apiSecret: apiSecret,
      url: livekitUrl,
    }
  }),
);
`;

  const loaderPath = path.join(projectRoot, 'agent-loader.js');
  fs.writeFileSync(loaderPath, loaderContent);
  console.log(`Generated agent loader at ${loaderPath}`);
  return loaderPath;
};

// Main execution
console.log(`Starting voice assistant agent for room: ${roomName}`);

// Generate the loader script
const loaderPath = generateLoader();

// Run the agent with the correct CLI command
console.log("Running agent with LiveKit Agents CLI...");

const command = `npx @livekit/agents dev \
  --url=${process.env.NEXT_PUBLIC_LIVEKIT_URL} \
  --api-key=${process.env.LIVEKIT_API_KEY} \
  --api-secret=${process.env.LIVEKIT_API_SECRET} \
  --log-level=debug \
  --agent=${loaderPath} \
  --worker-type=room \
  --room=${roomName}`;

console.log(`Executing: ${command}`);

const agentProcess = exec(command, { 
  env: {
    ...process.env,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  } 
});

agentProcess.stdout.pipe(process.stdout);
agentProcess.stderr.pipe(process.stderr);

agentProcess.on('exit', (code) => {
  console.log(`Agent process exited with code ${code}`);
});