"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import Cookies from "js-cookie";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UnionProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = Cookies.get("userId");
    const userRole = Cookies.get("userRole");

    if (!userId || !userRole) {
      toast.error("Vui lòng đăng nhập để xem thông tin");
      router.push("/login");
      return;
    }

    // Redirect non-LMHTX users
    if (userRole !== "LMHTX") {
      router.push("/profile");
      return;
    }

    // Fetch user data
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

    // Fetch report data
    fetch(`${API.result}/union/${userId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu báo cáo");
        }
        const data = await res.json();
        setReportData(data);
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi lấy dữ liệu báo cáo");
        console.error(error);
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
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileCard user={user} isAdmin />
        </TabsContent>
        <TabsContent value="reports">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê khảo sát</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.surveyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan HTX</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng số HTX:</span>
                      <span className="font-medium">{reportData?.totalHTX || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HTX đã khảo sát:</span>
                      <span className="font-medium">{reportData?.surveyedHTX || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HTX chưa khảo sát:</span>
                      <span className="font-medium">{reportData?.pendingHTX || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ khảo sát</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng số khảo sát:</span>
                      <span className="font-medium">{reportData?.totalSurveys || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đã hoàn thành:</span>
                      <span className="font-medium">{reportData?.completedSurveys || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tỷ lệ hoàn thành:</span>
                      <span className="font-medium">
                        {reportData?.completionRate ? `${reportData.completionRate}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
} 