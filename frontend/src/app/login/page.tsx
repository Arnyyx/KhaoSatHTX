"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { API } from "@/lib/api"
import Link from "next/link"
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'; // Import thư viện js-cookie

export default function LoginPage() {
    const { login } = useUser(); // Lấy hàm login từ UserContext
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
    const router = useRouter();

    //handle login
    const handleLogin = async () => {
        if (!username || !password) {
            setError('Tên đăng nhập và mật khẩu không được để trống');
            return;
        }

        setError(null); // Reset lỗi cũ
        setIsLoading(true); // Bắt đầu quá trình đăng nhập

        try {
            const res = await fetch(`${API.users}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({ username, password }),
            });

            setIsLoading(false); // Kết thúc quá trình đăng nhập

            if (res.ok) {
                const data = await res.json();
                console.log('Login thành công:', data);

                if (data.user && data.token) {
                    login(data.user, data.token); // Lưu thông tin người dùng và token vào context

                    // Lưu token vào cookie (cookie có thể có nhiều tuỳ chọn bảo mật)
                    Cookies.set('token', data.token, {
                        expires: 1, path: '/',
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Strict'
                    });

                    router.push('/profile'); // Điều hướng tới trang profile
                } else {
                    console.error('Dữ liệu không hợp lệ:', data);
                    setError('Dữ liệu đăng nhập không hợp lệ.');
                }
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            setIsLoading(false); // Kết thúc quá trình đăng nhập
            setError('Có lỗi xảy ra khi gửi yêu cầu');
            console.error(error);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-muted px-4">
            <Card className="w-full max-w-md shadow-lg border border-border">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold text-primary">Chào mừng trở lại</CardTitle>
                    <CardDescription>Vui lòng đăng nhập để tiếp tục</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tên đăng nhập</label>
                        <Input
                            type='text' value={username} onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                        <Input
                            type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)} required
                            placeholder="Nhập mật khẩu" />
                    </div>
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-primary text-white hover:bg-primary/90 transition"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <p className="text-sm text-center text-muted-foreground">
                        Chưa có tài khoản? <Link href="#" className="text-primary hover:underline">Liên hệ quản trị viên</Link>
                    </p>
                </CardContent>
            </Card>
        </main>
    )
}
