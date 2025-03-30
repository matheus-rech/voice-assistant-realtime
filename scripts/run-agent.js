const { WorkerOptions, cli } = require("@livekit/agents")
const { JobType } = require("@livekit/protocol")
const path = require("path")
const fs = require("fs")

// Try to load environment variables from .env.local if not already set
if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      console.log("Loading environment variables from .env.local")
      const envFile = fs.readFileSync(envPath, 'utf8')
      const envVars = envFile.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'))
      
      for (const line of envVars) {
        const [key, value] = line.split('=')
        if (key && value && !process.env[key]) {
          process.env[key] = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes if present
        }
      }
    }
  } catch (err) {
    console.warn("Could not load .env.local file:", err.message)
  }
}

// Import the agent (try both JS and TS paths)
let voiceAssistantAgent;
try {
  // First try the JS file
  const agentModule = require("../lib/livekit-agent.js");
  voiceAssistantAgent = agentModule.voiceAssistantAgent;
  console.log("Successfully loaded agent from livekit-agent.js");
} catch (err) {
  console.warn("Failed to load agent from livekit-agent.js:", err.message);
  try {
    // Try using the TS file directly (might work with ts-node)
    const agentModule = require("../lib/livekit-agent.ts");
    voiceAssistantAgent = agentModule.voiceAssistantAgent;
    console.log("Successfully loaded agent from livekit-agent.ts");
  } catch (err2) {
    console.error("Failed to load agent from livekit-agent.ts:", err2.message);
    console.error("Please run 'node fix-agent.js' first to create CommonJS compatible modules.");
    process.exit(1);
  }
}

// Get the room name from command line arguments or environment variables
const roomName = process.argv[2] || process.env.NEXT_PUBLIC_LIVEKIT_ROOM

if (!roomName) {
  console.error(
    "Room name is required. Provide it as an argument or set NEXT_PUBLIC_LIVEKIT_ROOM environment variable.",
  )
  process.exit(1)
}

// Verify we have the required environment variables
const requiredEnvVars = [
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "NEXT_PUBLIC_LIVEKIT_URL",
  "OPENAI_API_KEY"
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}

console.log(`Starting agent for room: ${roomName}`)
console.log(`Using LiveKit URL: ${process.env.NEXT_PUBLIC_LIVEKIT_URL}`)

// Set up a log file for debugging
const logFile = fs.createWriteStream(path.join(process.cwd(), `agent-${roomName}.log`), { flags: 'a' })
console.log(`Logging to: ${path.join(process.cwd(), `agent-${roomName}.log`)}`)

// Redirect console.log and console.error to both console and log file
const originalConsoleLog = console.log
const originalConsoleError = console.error

console.log = function() {
  const args = Array.from(arguments)
  originalConsoleLog.apply(console, args)
  logFile.write(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n')
}

console.error = function() {
  const args = Array.from(arguments)
  originalConsoleError.apply(console, args)
  logFile.write('[ERROR] ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n')
}

// Set up error handling to catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  logFile.end()
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

try {
  // Run the agent
  cli.runApp(
    new WorkerOptions({
      agent: voiceAssistantAgent,
      workerType: JobType.JT_ROOM,
      roomName: roomName,
      livekit: {
        apiKey: process.env.LIVEKIT_API_KEY,
        apiSecret: process.env.LIVEKIT_API_SECRET,
        url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
      }
    }),
  )
  
  console.log(`Agent started successfully for room: ${roomName}`)
} catch (err) {
  console.error("Failed to start agent:", err)
  process.exit(1)
}

