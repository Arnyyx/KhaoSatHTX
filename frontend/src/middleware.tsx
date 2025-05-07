import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  console.log('Token:', token) // Kiểm tra token trong middleware

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Gửi request validate về API route (serverless function chạy trong Node env)
  const res = await fetch(`${request.nextUrl.origin}/api/auth/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (res.status !== 200) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}
