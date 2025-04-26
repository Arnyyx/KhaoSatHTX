"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
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
                        <Input placeholder="Nhập tên đăng nhập" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                        <Input type="password" placeholder="Nhập mật khẩu" />
                    </div>
                    <Link href="/profile">
                        <Button className="w-full bg-primary text-white hover:bg-primary/90 transition">Đăng nhập</Button>
                    </Link>
                    <p className="text-sm text-center text-muted-foreground">
                        Chưa có tài khoản? <Link href="#" className="text-primary hover:underline">Liên hệ quản trị viên</Link>
                    </p>
                </CardContent>
            </Card>
        </main>
    )
}
