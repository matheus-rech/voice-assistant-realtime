import { type JobContext, defineAgent, multimodal } from "@livekit/agents"
import * as openai from "@livekit/agents-plugin-openai"

export const medicalAssistantAgent = defineAgent({
  entry: async (ctx: JobContext) => {
    try {
      await ctx.connect()
      console.log(`Medical assistant connected to room: ${ctx.room.name}`)

      const agent = new multimodal.MultimodalAgent({
        model: new openai.realtime.RealtimeModel({
          instructions: `To effectively support a medical professional diagnosed with ADHD studying for
          the USMLE: Provide seamless assistance through screen sharing by reading aloud
          requested segments of the material, including questions, answers, and
          corrections. Additionally, facilitate discussions on related topics and engage
          in interactive flashcard sessions. Prioritize clarity, conciseness, and
          engagement to maximize productivity during study sessions.
          
          Real-time guidelines:
          - Respond quickly and concisely to maintain engagement
          - Use visual cues from the screen to provide contextually relevant information
          - Chunk information into digestible pieces for better ADHD-friendly learning
          - Use active dialogue to maintain the user's attention
          - Provide immediate feedback on practice questions
          - Help track progress and maintain focus during longer study sessions`,
          
          voice: "nova", // Using nova for a more natural voice
          temperature: 0.7,
          maxResponseOutputTokens: Number.POSITIVE_INFINITY,
          // Enable all modalities for a complete study assistant experience
          // Latest modalities API format
          modalities: {
            audio: true,
            vision: true,
            text: true
          },
          // Optimize turn detection for more responsive interactions
          turnDetection: {
            type: "server_vad",
            threshold: 0.4, // Lower threshold for better responsiveness
            silence_duration_ms: 350, // Shorter silence duration for faster turn detection
            prefix_padding_ms: 250, 
          },
          // Enable streaming for real-time responses
          streaming: {
            enabled: true,
            partial: true, // Enable partial responses for more natural conversation
            chunkSize: 20, // Optimal chunk size for real-time performance
          },
        }),
      })

      await agent.start(ctx.room)
      console.log("Medical assistant agent started successfully with real-time capabilities")
    } catch (error) {
      console.error("Error starting medical assistant agent:", error)
      throw error
    }
  },
})

