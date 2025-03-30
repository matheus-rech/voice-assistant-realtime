import "server-only"
import { AccessToken } from "livekit-server-sdk"

export async function generateToken(room: string, username: string) {
  // Get LiveKit API key and secret from environment variables
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API key or secret not configured")
  }

  // Create a new access token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
  })

  // Grant permissions to the user
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  // Generate the token
  return at.toJwt()
}

