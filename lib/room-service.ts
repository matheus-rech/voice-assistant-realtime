import { type Room, RoomServiceClient } from "livekit-server-sdk"

// Initialize the RoomServiceClient with error handling
const getLivekitClient = () => {
  const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""
  const apiKey = process.env.LIVEKIT_API_KEY || ""
  const apiSecret = process.env.LIVEKIT_API_SECRET || ""

  if (!livekitHost || !apiKey || !apiSecret) {
    throw new Error("LiveKit configuration missing. Please check environment variables.")
  }

  // Remove wss:// or ws:// prefix if present for the RoomServiceClient
  const host = livekitHost.replace(/^(wss?:\/\/)/, "https://")

  return new RoomServiceClient(host, apiKey, apiSecret)
}

// Create a room with options
export async function createRoom(
  name: string,
  options?: {
    emptyTimeout?: number
    maxParticipants?: number
  },
): Promise<Room> {
  const roomService = getLivekitClient()

  const opts = {
    name,
    emptyTimeout: options?.emptyTimeout || 10 * 60, // 10 minutes default
    maxParticipants: options?.maxParticipants || 20,
  }

  return roomService.createRoom(opts)
}

// List all rooms
export async function listRooms(): Promise<Room[]> {
  const roomService = getLivekitClient()
  return roomService.listRooms()
}

// Get a specific room - use listRooms and filter since getRoom may not be available
export async function getRoom(name: string): Promise<Room | null> {
  const roomService = getLivekitClient()

  try {
    // Check if getRoom is available
    if (typeof roomService.getRoom === 'function') {
      return await roomService.getRoom(name)
    } else {
      // Fallback to listRooms and filter
      const rooms = await roomService.listRooms()
      return rooms.find(room => room.name === name) || null
    }
  } catch (error) {
    console.error(`Error getting room ${name}:`, error)
    return null
  }
}

// Delete a room
export async function deleteRoom(name: string): Promise<boolean> {
  const roomService = getLivekitClient()
  
  try {
    // Check if deleteRoom is available
    if (typeof roomService.deleteRoom === 'function') {
      await roomService.deleteRoom(name)
      return true
    } else {
      console.warn('deleteRoom method not available on RoomServiceClient')
      return false
    }
  } catch (error) {
    console.error(`Error deleting room ${name}:`, error)
    return false
  }
}

// Check if a room exists
export async function roomExists(name: string): Promise<boolean> {
  try {
    const room = await getRoom(name)
    return !!room
  } catch (error) {
    return false
  }
}

