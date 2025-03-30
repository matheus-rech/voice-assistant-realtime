/**
 * Shared AudioContext singleton to prevent multiple context creation
 */

// This file provides a singleton AudioContext to be used across the application
// to prevent the "Failed to execute 'connect' on 'AudioNode': cannot connect to an AudioNode belonging to a different audio context" error

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Store the shared audio context in a global variable
declare global {
  interface Window {
    __SHARED_AUDIO_CONTEXT__?: AudioContext;
  }
}

export function getSharedAudioContext(): AudioContext {
  if (!isClient) {
    throw new Error('Cannot create AudioContext on server side');
  }
  
  // Check if the audio context already exists in the global window object
  if (!window.__SHARED_AUDIO_CONTEXT__) {
    try {
      // Create the audio context only once and store it in the window object
      window.__SHARED_AUDIO_CONTEXT__ = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[AudioContext] Created global shared AudioContext');
    } catch (error) {
      console.error('[AudioContext] Failed to create AudioContext:', error);
      throw error;
    }
  }
  
  return window.__SHARED_AUDIO_CONTEXT__;
}

// Function to safely suspend the audio context when not in use
export function suspendAudioContext(): void {
  if (!isClient) return;
  
  const ctx = window.__SHARED_AUDIO_CONTEXT__;
  if (ctx && ctx.state === 'running') {
    ctx.suspend().catch(err => {
      console.error('[AudioContext] Error suspending AudioContext:', err);
    });
  }
}

// Function to safely resume the audio context when needed
export function resumeAudioContext(): Promise<void> {
  if (!isClient) return Promise.resolve();
  
  if (!window.__SHARED_AUDIO_CONTEXT__) {
    getSharedAudioContext();
  }
  
  const ctx = window.__SHARED_AUDIO_CONTEXT__;
  if (ctx && ctx.state === 'suspended') {
    return ctx.resume().catch(err => {
      console.error('[AudioContext] Error resuming AudioContext:', err);
    });
  }
  
  return Promise.resolve();
}

// Clean up function to close the audio context when it's no longer needed
export function closeAudioContext(): void {
  if (!isClient) return;
  
  const ctx = window.__SHARED_AUDIO_CONTEXT__;
  if (ctx) {
    ctx.close().catch(err => {
      console.error('[AudioContext] Error closing AudioContext:', err);
    });
    delete window.__SHARED_AUDIO_CONTEXT__;
  }
}