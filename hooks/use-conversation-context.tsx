import { useState, useCallback, useRef } from 'react';

interface ConversationContext {
  recentMessages: Array<{ role: "user" | "assistant"; content: string }>;
  screenShared: boolean;
  cameraEnabled: boolean;
}

/**
 * Hook for managing AI conversation context with advanced context awareness
 */
export function useConversationContext(maxContextSize = 10) {
  const [screenShared, setScreenShared] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  
  // Use ref for messages to avoid unnecessary re-renders
  const messagesRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
  
  // Update conversation history
  const addMessage = useCallback((message: { role: "user" | "assistant"; content: string }) => {
    messagesRef.current = [...messagesRef.current, message].slice(-maxContextSize);
  }, [maxContextSize]);
  
  // Add multiple messages
  const updateMessages = useCallback((messages: Array<{ role: "user" | "assistant"; content: string }>) => {
    messagesRef.current = messages.slice(-maxContextSize);
  }, [maxContextSize]);
  
  // Clear history
  const clearMessages = useCallback(() => {
    messagesRef.current = [];
  }, []);
  
  // Update screen sharing status
  const updateScreenShared = useCallback((isShared: boolean) => {
    setScreenShared(isShared);
  }, []);
  
  // Update camera status
  const updateCameraEnabled = useCallback((isEnabled: boolean) => {
    setCameraEnabled(isEnabled);
  }, []);
  
  // Generate a system prompt based on current context
  const generateSystemPrompt = useCallback((basePrompt: string = "") => {
    let systemPrompt = basePrompt || `You're a helpful voice assistant. Respond in a friendly, conversational way that would sound natural when spoken aloud.
    Keep responses concise and avoid lengthy explanations.`;
    
    // Add context about available modalities
    if (screenShared && cameraEnabled) {
      systemPrompt += `\n\nThe user is currently sharing their screen with you and has their camera enabled. You can see both the user and their screen.
      When appropriate, refer to what might be on their screen or what you can see through the camera.
      For example, if they ask about a document, assume they're looking at it and offer to help read or explain parts of it.
      If they're sharing audio, you can also reference sounds or music they might be playing.`;
    } else if (screenShared) {
      systemPrompt += `\n\nThe user is currently sharing their screen with you. They may be asking about something they're looking at.
      When appropriate, refer to what might be on their screen and offer to help with what they're viewing.
      For example, if they ask about a document, assume they're looking at it and offer to help read or explain parts of it.
      If they're sharing audio, you can also reference sounds or music they might be playing.`;
    } else if (cameraEnabled) {
      systemPrompt += `\n\nThe user has their camera enabled, so you can see them. You may reference what you can see through the camera if relevant.
      For example, if they ask how they look or to comment on something visible, you can respond accordingly.`;
    }
    
    return systemPrompt;
  }, [screenShared, cameraEnabled]);
  
  // Get the current context state
  const getContext = useCallback((): ConversationContext => {
    return {
      recentMessages: [...messagesRef.current],
      screenShared,
      cameraEnabled,
    };
  }, [screenShared, cameraEnabled]);
  
  return {
    addMessage,
    updateMessages,
    clearMessages,
    updateScreenShared,
    updateCameraEnabled,
    generateSystemPrompt,
    getContext,
  };
}