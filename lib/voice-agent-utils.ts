/**
 * Utility functions for working with voice agents using OpenAI's latest API
 */

import { Message } from "ai";

/**
 * Build a properly formatted messages array for OpenAI API
 * @param systemPrompt The system prompt
 * @param conversationHistory Previous conversation history
 * @param userMessage Latest user message
 * @returns Formatted messages array
 */
export function buildMessagesWithContext(
  systemPrompt: string,
  conversationHistory: Message[] = [],
  userMessage: string
): Message[] {
  return [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];
}

/**
 * Get optimal streaming config based on network conditions
 * @param isHighLatency Whether the network has high latency
 * @returns Streaming configuration object
 */
export function getStreamingConfig(isHighLatency = false) {
  return {
    enabled: true,
    partial: true,
    chunkSize: isHighLatency ? 10 : 20,
  };
}

/**
 * Get optimal voice parameters for different use cases
 * @param voiceType The type of voice to use (casual, professional, etc.)
 * @returns Voice configuration object
 */
export function getVoiceConfig(voiceType: 'casual' | 'professional' | 'natural' = 'natural') {
  switch (voiceType) {
    case 'casual':
      return {
        voice: "alloy",
        temperature: 0.8,
        speechRate: 1.1,
      };
    case 'professional':
      return {
        voice: "onyx",
        temperature: 0.6,
        speechRate: 1.0,
      };
    case 'natural':
    default:
      return {
        voice: "nova",
        temperature: 0.7,
        speechRate: 1.05,
      };
  }
}

/**
 * Get optimal turn detection parameters
 * @param sensitivity How sensitive the turn detection should be ('high', 'medium', 'low')
 * @returns Turn detection configuration object
 */
export function getTurnDetectionConfig(sensitivity: 'high' | 'medium' | 'low' = 'medium') {
  switch (sensitivity) {
    case 'high':
      return {
        type: "server_vad" as const,
        threshold: 0.3,
        silence_duration_ms: 300,
        prefix_padding_ms: 200,
      };
    case 'low':
      return {
        type: "server_vad" as const,
        threshold: 0.5,
        silence_duration_ms: 600,
        prefix_padding_ms: 400,
      };
    case 'medium':
    default:
      return {
        type: "server_vad" as const,
        threshold: 0.4,
        silence_duration_ms: 400,
        prefix_padding_ms: 250,
      };
  }
}