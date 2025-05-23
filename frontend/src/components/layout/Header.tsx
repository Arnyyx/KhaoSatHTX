"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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

// Custom hook to listen for cookie changes
function useCookieChange(cookieName: string) {
    const [value, setValue] = useState<string | undefined>(undefined);

    useEffect(() => {
        const checkCookie = () => {
            const cookieValue = Cookies.get(cookieName);
            setValue(cookieValue);
        };

        // Check initially
        checkCookie();

        // Set up an interval to check for changes
        const interval = setInterval(checkCookie, 1000);

        return () => clearInterval(interval);
    }, [cookieName]);

    return value;
}

export function Header() {
    const router = useRouter();
    const userRole = useCookieChange("userRole");

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
                ];
            case "LMHTX":
                return [
                    { label: "Thông tin cá nhân", href: "/union/profile" },
                    { label: "Báo cáo", href: "/union/reports" },
                    { label: "Quản lý HTX", href: "/union/management" },
                ];
            case "HTX":
                return [{ label: "Làm khảo sát", href: "/survey" }];
            case "QTD":
                return [{ label: "Làm khảo sát", href: "/survey" }];
            default:
                return [];
        }
    };

    return (
  <div className="header-area">
    <div style={{ backgroundColor: "#b3e5fc" }}>
      <div className="header-mid gray-bg menu-wrapper">
        <div className="row">
          <div className="row d-flex align-items-center">
            <div className="col-md-12">
              <div
                style={{
                  width: "1250px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 20px",
                  fontSize: "16px",
                  color: "#1a237e",
                  margin: "0 auto",
                  fontWeight: 500,
                }}
              >
                <div>Trang thông tin Khảo sát Chỉ số hài lòng cấp tỉnh năm 2024</div>
                <div>
                  <i className="fas fa-phone-alt" style={{ marginRight: 6 }}></i>
                  (+84) 123 456 789
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="header-bottom header-sticky">
      <div className="menu-wrapper">
        <div className="container content-wrapper">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 20px",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/assets/img/logo ubkt.svg"
                alt="Logo"
                style={{ width: "auto", height: "80px" }}
              />
            </div>

            <nav
              style={{
                display: "flex",
                gap: "24px",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              <a
                href="/"
                style={{
                  color: "#e53935",
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                TRANG CHỦ
                <div
                  style={{
                    height: "4px",
                    backgroundColor: "#2b2d80",
                    width: "100%",
                    position: "absolute",
                    bottom: -10,
                  }}
                />
              </a>
              <a href="/intro"  style={{ color: "#000", textDecoration: "none" }}   >
                GIỚI THIỆU
              </a>
              <a href="/survey" style={{ color: "#000", textDecoration: "none" }}>
                KHẢO SÁT
              </a>
              <a href="/news" style={{ color: "#000", textDecoration: "none" }}>
                TIN TỨC
              </a>
              <a href="/report" style={{ color: "#000", textDecoration: "none" }}>
                BÁO CÁO
              </a>
              <a href="/login">ĐĂNG NHẬP</a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}