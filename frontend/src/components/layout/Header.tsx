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

export function Header() {
    const router = useRouter();
    const userRole = Cookies.get("userRole");

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
                    { label: "Báo cáo", href: "/union/reports" },
                    { label: "Quản lý HTX", href: "/union/htx" },
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
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container flex h-16 items-center justify-around">
                <div className="flex items-center gap-8">
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent"
                        onClick={() => router.push("/")}
                    >
                        <Image
                            src="/logo.png"
                            alt="HTX Survey Logo"
                            width={40}
                            height={40}
                            className="mr-2"
                        />
                        <span className="text-lg font-bold hover:text-accent-foreground transition-colors">
                            HTX Survey
                        </span>
                    </Button>
                    {userRole && (
                        <nav className="flex items-center gap-2">
                            {getNavigationItems().map((item) => (
                                <Button
                                    key={item.href}
                                    variant="ghost"
                                    className="text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={() => router.push(item.href)}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {userRole ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="sr-only">Tài khoản</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="font-medium">Tài khoản</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.push("/profile")}
                                    className="cursor-pointer hover:bg-accent"
                                >
                                    Thông tin cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer hover:bg-accent"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="default"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            onClick={() => router.push("/login")}
                        >
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}