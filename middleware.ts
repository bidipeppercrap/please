import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyUser } from './lib/jwt'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('session')?.value
    const { pathname } = request.nextUrl

    const currentSession = !token ? null : await verifyUser(token!)

    if (!currentSession && !pathname.startsWith('/login') && !pathname.startsWith('/noroot'))
        return NextResponse.redirect(new URL('/login', request.url))

    if (currentSession! && (pathname.startsWith('/login') || pathname.startsWith('/noroot'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }
}
 
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)'
  ],
}