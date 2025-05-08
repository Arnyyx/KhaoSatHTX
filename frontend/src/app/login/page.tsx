"use client";

import { login } from '@/app/apis/login';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const ID_user = Cookies.get("ID_user");
    console.log("🔍 DEBUG - Cookie hiện tại:", ID_user);

    if (ID_user) {
      router.push("/profile");
    }
  }, [router]);

  const handleLogin = async () => {
    const data = await login(username, password);
    console.log("🔁 DEBUG - Kết quả từ API login:", data);
  
    if (data.success && data.user.Id && data.user.Role) {
      Cookies.set("ID_user", data.user.Id, { expires: 1 });
      Cookies.set("role", data.user.Role.toLowerCase(), { expires: 1 });
      router.push("/profile");
    } else {
      alert(data.message || "Đăng nhập thất bại.");
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
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mật khẩu</label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90 transition"
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}