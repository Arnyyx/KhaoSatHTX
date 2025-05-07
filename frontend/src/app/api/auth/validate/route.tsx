// app/api/auth/validate/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import client from '@/utils/redisClient'

const SECRET_KEY = process.env.SECRET_KEY as string

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  try {
    // Giải mã token với SECRET_KEY
    const decoded = jwt.verify(token, SECRET_KEY)
    console.log('Decoded Token:', decoded) // Kiểm tra decoded token

    // Kiểm tra token trong Redis whitelist
    const sessionData = await client.get(`whitelist:${token}`)
    if (!sessionData) {
      throw new Error('Token not in whitelist')
    }

    return NextResponse.json({ valid: true })
  } catch (err) {
    console.error('Token validation error:', err)
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
