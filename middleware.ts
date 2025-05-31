import { NextResponse } from "next/server"
import type { NextRequest } from "next/request"

export function middleware(request: NextRequest) {
  // Permitir todas las rutas de Socket.IO
  if (request.nextUrl.pathname.startsWith("/socket.io/")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
