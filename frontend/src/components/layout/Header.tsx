"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { logout } from "@/app/apis/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

function useCookieChange(cookieName: string) {
  const [value, setValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkCookie = () => {
      const cookieValue = Cookies.get(cookieName);
      setValue(cookieValue);
    };

    checkCookie();
    const interval = setInterval(checkCookie, 1000);

    return () => clearInterval(interval);
  }, [cookieName]);

  return value;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const userRole = useCookieChange("userRole");
  const userId = useCookieChange("userId");

  const handleLogout = async () => {
    try {
      const data = await logout();
      if (data.success) {
        Cookies.remove("token");
        Cookies.remove("userRole");
        Cookies.remove("userId");
        toast.success("Đăng xuất thành công");
        router.push("/login");
      } else {
        toast.error(data.message || "Đăng xuất thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { label: "Thông tin cá nhân", href: "/admin/profile" },
          { label: "Quản lý người dùng", href: "/admin/users" },
          { label: "Quản lý khảo sát", href: "/admin/surveys" },
          // { label: "Quản lý câu hỏi", href: "/admin/questions" },
          { label: "Quản lý tỉnh", href: "/admin/provinces" },
          { label: "Quản lý phường/xã", href: "/admin/wards" },
          { label: "Test", href: "/test" },
          { label: "Thống kê", href: "/dashboard" },
        ];
      case "LMHTX":
        return [
          { label: "Thông tin cá nhân", href: "/union/profile" },
          { label: "Báo cáo", href: "/union/reports" },
          { label: "Quản lý HTX", href: "/union/management" },
          { label: "Thống kê", href: "/dashboard" },
        ];
      case "UBKT":
        return [
          { label: "Thông tin cá nhân", href: "/union/profile" },
          { label: "Báo cáo", href: "/union/reports" },
          { label: "Quản lý HTX", href: "/union/management" },
          { label: "Thống kê", href: "/dashboard" },
        ];
      case "HTX":
        return [
          { label: "Thông tin cá nhân", href: "/profile" },
          { label: "Làm khảo sát", href: "/survey" },
        ];
      case "QTD":
        return [
          { label: "Thông tin cá nhân", href: "/profile" },
          { label: "Làm khảo sát", href: "/survey" },
        ];
      default:
        return [];
    }
  };

  // Common navigation items that are always shown
  const commonNavItems = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "GIỚI THIỆU", href: "/intro" },
    { label: "KHẢO SÁT", href: "/survey" },
    { label: "TIN TỨC", href: "/news" },
    { label: "BÁO CÁO", href: "/report" },
  ];

  // Get role-specific items
  const roleNavItems = getNavigationItems();

  return (
    <header className="w-full">
      {/* Top info bar */}
      <div className="w-full bg-[#b3e5fc]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-[#1a237e] font-medium">
          <div>Trang thông tin Khảo sát Chỉ số hài lòng cấp tỉnh năm 2024</div>
          <div className="flex items-center">
            <span className="mr-1">
              <i className="fas fa-phone-alt"></i>
            </span>
            (+84) 123 456 789
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/assets/img/logo ubkt.svg"
              alt="Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Common navigation items */}
            <nav className="flex items-center gap-6 mr-4">
              {commonNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-medium text-lg relative transition-colors hover:text-[#e53935]",
                    pathname === item.href
                      ? "text-[#e53935]"
                      : "text-gray-800"
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <div className="absolute w-full h-1 bg-[#2b2d80] bottom-[-10px]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* User menu or login button */}
            {userId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User size={16} />
                    {userRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Role-specific navigation items */}
                  {roleNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">ĐĂNG NHẬP</Link>
              </Button>
            )}
          </div>

          {/* Nút menu mobile */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Menu Mobile Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body text-uppercase fw-medium">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link text-danger" href="/">Trang chủ</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/intro">Giới thiệu</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/survey">Khảo sát</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/news">Tin tức</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/report">Báo cáo</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/login">Đăng nhập</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
