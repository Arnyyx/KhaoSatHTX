import { NextResponse } from 'next/server';
import redis from '@/lib/redis';  // Import Redis client

export async function routerchecking(req) {
    const token = req.cookies.get('token'); // Lấy token từ cookies (hoặc headers)
    
    if (!token) {
        // Nếu không có token, chuyển hướng tới trang đăng nhập
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Kiểm tra token trong Redis
    const userId = await redis.get(`auth:${token}`);
    
    if (!userId) {
        // Nếu không tìm thấy token trong Redis, chuyển hướng tới trang đăng nhập
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Token hợp lệ, cho phép tiếp tục truy cập
    return NextResponse.next();
}

export const config = {
    matcher: ['/profile', '/admin'],  // Các route cần bảo vệ
};
