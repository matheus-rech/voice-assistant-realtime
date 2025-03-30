import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only apply to /api/livekit-token route
  if (request.nextUrl.pathname.startsWith("/api/livekit-token")) {
    // Check if the request is coming from the same origin
    const origin = request.headers.get("origin")
    const host = request.headers.get("host")

    // If origin is not set or doesn't match the host, reject the request
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/livekit-token",
}

