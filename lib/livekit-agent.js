// Auto-generated CommonJS wrapper for /Users/matheusrech/Documents/voice-assistant-realtime/lib/livekit-agent.ts
import { type JobContext, defineAgent, multimodal } from "@livekit/agents"
import * as openai from "@livekit/agents-plugin-openai"

// Define the voice assistant agent with enhanced capabilities
export const voiceAssistantAgent = defineAgent({
  entry: async (ctx: JobContext) => {
    try {
      // Connect to the room
      await ctx.connect()
      console.log(`Agent connected to room: ${ctx.room.name}`)

      // Create a multimodal agent with OpenAI
      const agent = new multimodal.MultimodalAgent({
        model: new openai.realtime.RealtimeModel({
          instructions: `You are a helpful voice assistant that can see the user's screen if they're sharing it.
          
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
          - Adapt your responses based on what you can observe about the user's environment`,

          voice: "nova", // Using nova for a more natural voice - options: alloy, echo, fable, onyx, nova, shimmer
          temperature: 0.7,
          maxResponseOutputTokens: Number.POSITIVE_INFINITY,
          // Enable all modalities for a complete awareness experience
          // Latest modalities API format
          modalities: {
            audio: true,
            vision: true,
            text: true
          },
          // Optimize turn detection for more responsive interactions
          turnDetection: {
            type: "server_vad",
            threshold: 0.4, // Slightly lower threshold for better responsiveness
            silence_duration_ms: 400, // Shorter silence duration for faster turn detection
            prefix_padding_ms: 250, // Slightly reduced prefix padding
          },
          // Enable streaming for real-time responses
          streaming: {
            enabled: true,
            partial: true, // Enable partial responses for incremental updates
            chunkSize: 20, // Optimal chunk size for real-time performance
          },
        }),
      })

      // Start the agent in the room
      await agent.start(ctx.room)
      console.log("Agent started successfully with enhanced real-time capabilities")
    } catch (error) {
      console.error("Error starting agent:", error)
      throw error
    }
  },
})



// CommonJS module.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { voiceAssistantAgent };
}
