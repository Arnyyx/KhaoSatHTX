"use client";

import { login } from '@/app/apis/login';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const userRole = Cookies.get("userRole");

    if (token && userRole) {
      if (userRole === 'admin') router.push("/admin");
      else if (userRole === 'LMHTX') router.push("/union");
      else if (['HTX', 'QTD'].includes(userRole)) router.push("/profile");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(username, password);

      if (data.success && data.user.Id && data.user.Role) {
        Cookies.set("token", data.token, { expires: 1 });
        Cookies.set("userRole", data.user.Role, { expires: 1 });
        Cookies.set("userId", data.user.Id.toString(), { expires: 1 });
        Cookies.set("provinceId", data.user.ProvinceId.toString(), { expires: 1 });

        toast.success("Đăng nhập thành công");

        if (data.user.Role === 'admin') router.push("/admin");
        else if (data.user.Role === 'LMHTX') router.push("/union");
        else if (['HTX', 'QTD'].includes(data.user.Role)) router.push("/profile");
      } else {
        toast.error(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted px-4" style={{position: 'relative'}} >
      <Card className="w-full max-w-md shadow-lg border border-border" style={{position: 'absolute',top: '70px',}} >
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">Đăng nhập - Ủy ban kiểm tra Liên Minh HTX Việt Nam</CardTitle>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tên đăng nhập</label>
              <Input
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mật khẩu</label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="d-flex justify-content-between login">
            <Button
              type="submit"
              className=" w-50  text-white hover:bg-intro/90 transition fas fa-sign-in-alt me-2"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
           <Button className=" w-50">
              <a href="/">Trang Chủ</a>
            </Button>
          </div>
            
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
