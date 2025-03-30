import "server-only"
import { AccessToken } from "livekit-server-sdk"
import { roomExists, createRoom } from "./room-service"

export async function generateToken(roomName: string, username: string) {
  // Get LiveKit API key and secret from environment variables
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API key or secret not configured")
  }

  try {
    // Check if the room exists, create it if it doesn't
    const exists = await roomExists(roomName)
    if (!exists) {
      await createRoom(roomName)
    }
  } catch (error) {
    console.error("Error checking/creating room:", error)
    // Continue anyway to generate token
  }

  // Create a new access token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    // Token to expire after 24 hours
    ttl: "24h",
  })

  // Grant permissions to the user
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  // Generate the token
  return at.toJwt()
}

