"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import Cookies from "js-cookie";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = Cookies.get("userId");
    const userRole = Cookies.get("userRole");

    if (!userId || !userRole) {
      toast.error("Vui lòng đăng nhập để xem thông tin");
      router.push("/login");
      return;
    }

    // Redirect admin to admin profile
    if (userRole === "admin") {
      router.push("/admin/profile");
      return;
    }

    fetch(`${API.users}/${userId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Không thể lấy thông tin người dùng");
        }
        const data = await res.json();
        setUser(data.user);
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi lấy thông tin người dùng");
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="container py-10">
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="container py-10">
      <ProfileCard user={user} />
    </main>
  );
}
