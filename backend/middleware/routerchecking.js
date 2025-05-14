import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function routerchecking(req) {
    const token = req.cookies.get('token');
    
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const userId = await redis.get(`auth:${token}`);
    
    if (!userId) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile', '/admin'],
};
