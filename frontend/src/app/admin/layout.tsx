"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="container mx-auto py-6">
            <Tabs value={pathname} className="mb-6">
                <TabsList>
                    <Link href="/admin/users">
                        <TabsTrigger value="/admin/users">Quản lý người dùng</TabsTrigger>
                    </Link>
                    <Link href="/admin/surveys">
                        <TabsTrigger value="/admin/surveys">Quản lý khảo sát</TabsTrigger>
                    </Link>
                    <Link href="/admin/questions">
                        <TabsTrigger value="/admin/questions">Quản lý câu hỏi</TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>
            {children}
        </div>
    );
} 