"use client"

import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import { API } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Config } from "@/lib/config"
import { Download } from "lucide-react"

type SurveyInfo = {
    Id: number
    Title: string
    Description: string
    StartTime: string
    EndTime: string
    QuestionCount: number
    finishedNum: number
    totalNum: number
}

interface User {
    Id: number;
    Username: string;
    Name: string | null;
    Email: string;
    Role: "LMHTX" | "QTD" | "HTX" | "admin" | "UBKT";
    Status: boolean | null;
    IsLocked: boolean | null;
    OrganizationName?: string | null;
    Type?: "PNN" | "NN";
    ProvinceId?: number | null;
    WardId?: number | null;
    Address?: string | null;
    Position?: string | null;
    MemberCount?: number | null;
    EstablishedDate?: string | null;
    IsMember?: boolean | null;
    SurveyTime?: number | null;
    Province?: string | null;
    Ward?: string | null;
}

export default function DashboardProgress() {
    const searchParams = useSearchParams();
    const year = Number(searchParams.get("year")) || new Date().getFullYear();
    const [surveyInfo, setSurveyInfo] = useState<SurveyInfo[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isMemberFilter, setIsMemberFilter] = useState<string>("all");
    const [surveyStatusFilter, setSurveyStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchSurveyProgress();
        fetchUsers();
    }, [year, currentPage, isMemberFilter, surveyStatusFilter]);

    const fetchSurveyProgress = async () => {
        try {
            const queryParams = new URLSearchParams({
                year: year.toString()
            });
            
            if (isMemberFilter !== "all") {
                queryParams.append('is_member', isMemberFilter);
            }
            if (Cookies.get("userRole") === "LMHTX") {
                queryParams.append('province_id', Cookies.get("provinceId") || "");
            }
            const surveyRes = await fetch(`${API.surveys}/progress?${queryParams.toString()}`);
            const surveyData = await surveyRes.json();
            setSurveyInfo(surveyData.surveys);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch survey data");
        }
    };

    const fetchUsers = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: Config.limit.toString(),
                year: year.toString()
            });
            
            if (isMemberFilter !== "all") {
                queryParams.append('is_member', isMemberFilter);
            }

            if (surveyStatusFilter !== "all") {
                queryParams.append('survey_status', surveyStatusFilter);
            }
            if (Cookies.get("userRole") === "LMHTX") {
                queryParams.append('province_id', Cookies.get("provinceId") || "");
            }

            const userRes = await fetch(`${API.users}/survey?${queryParams.toString()}`);
            const userData = await userRes.json();
            setUsers(userData.items);
            setTotalPages(userData.total);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users data");
        }
    };

    const pieData = useMemo(() => {
        const participatedCount = surveyInfo.reduce((sum, item) => sum + item.finishedNum, 0);
        const totalCount = surveyInfo.reduce((sum, item) => sum + item.totalNum, 0);
        return [
            { name: "Đã tham gia", value: participatedCount },
            { name: "Chưa tham gia", value: totalCount - participatedCount },
        ];
    }, [surveyInfo]);

    const barData = useMemo(() => {
        return surveyInfo.map(survey => ({
            name: survey.Title,
            completed: survey.finishedNum,
            total: survey.totalNum,
            completionRate: (survey.finishedNum / survey.totalNum) * 100
        }));
    }, [surveyInfo]);

    const COLORS = ['#0088FE', '#FF8042'];

    const handleExportProgress = async () => {
        try {
            const query = Cookies.get("userRole") === "LMHTX" ? `&province_id=${Cookies.get("provinceId")}` : "";
            const response = await fetch(`${API.surveys}/progress/export?year=${year}${query}`, {
                method: 'GET',
            });
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `survey-progress-${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting progress:', error);
            toast.error('Failed to export progress data');
        }
    };

    const handleExportUsers = async () => {
        try {
            const queryParams = new URLSearchParams({
                year: year.toString()
            });
            
            if (isMemberFilter !== "all") {
                queryParams.append('is_member', isMemberFilter);
            }
            if (Cookies.get("userRole") === "LMHTX") {
                queryParams.append('province_id', Cookies.get("provinceId") || "");
            }
            const response = await fetch(`${API.users}/survey/export?${queryParams.toString()}`, {
                method: 'GET',
            });
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `survey-users-${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting users:', error);
            toast.error('Failed to export users data');
        }
    };
    const router = useRouter();
    useEffect(() => {
        const userId = Cookies.get("userId");
        const userR = Cookies.get("userRole");
    
        if (!userId || !userR) {
        toast.error("Vui lòng đăng nhập để xem thông tin");
        router.push("/login");
        return;
        }
    
        // Redirect non-admin users to regular profile
        if (userR === "HTX" || userR === "QTD") {
            router.push("/profile");
            return;
        }
    }, [router]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tiến độ khảo sát năm {year}</h1>
                <Button onClick={handleExportProgress} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Xuất Excel
                </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Tổng quan tiến độ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            
                        </div>
                        <div>
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Thống kê HTX hoàn thành khảo sát</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <h3 className="text-lg font-semibold text-green-800">Đã hoàn thành</h3>
                                            <p className="text-2xl font-bold text-green-900">{surveyInfo.reduce((sum, item) => sum + item.finishedNum, 0)} HTX</p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-lg">
                                            <h3 className="text-lg font-semibold text-red-800">Chưa hoàn thành</h3>
                                            <p className="text-2xl font-bold text-red-900">{surveyInfo.reduce((sum, item) => sum + item.totalNum, 0)} HTX</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tiến độ theo khảo sát</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="completionRate" name="Tỷ lệ hoàn thành (%)" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Chi tiết khảo sát</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Tên khảo sát</th>
                                    <th className="text-left p-2">Số người đã tham gia</th>
                                    <th className="text-left p-2">Tổng số người</th>
                                    <th className="text-left p-2">Tỷ lệ hoàn thành</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surveyInfo.map((survey) => (
                                    <tr key={survey.Id} className="border-b">
                                        <td className="p-2">{survey.Title}</td>
                                        <td className="p-2">{survey.finishedNum}</td>
                                        <td className="p-2">{survey.totalNum}</td>
                                        <td className="p-2">
                                            {((survey.finishedNum / survey.totalNum) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Danh sách người dùng</CardTitle>
                        <div className="flex items-center gap-4">
                            <Select
                                value={isMemberFilter}
                                onValueChange={(value) => {
                                    setIsMemberFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Lọc theo thành viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="true">Là thành viên</SelectItem>
                                    <SelectItem value="false">Không phải thành viên</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={surveyStatusFilter}
                                onValueChange={(value) => {
                                    setSurveyStatusFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Trạng thái khảo sát" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="true">Đã hoàn thành</SelectItem>
                                    <SelectItem value="false">Chưa hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleExportUsers} className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Xuất Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Tên</th>
                                    <th className="text-left p-2">Email</th>
                                    <th className="text-left p-2">Tổ chức</th>
                                    <th className="text-left p-2">Vai trò</th>
                                    <th className="text-left p-2">Tỉnh/Thành</th>
                                    <th className="text-left p-2">Quận/Huyện</th>
                                    <th className="text-left p-2">Thành viên</th>
                                    <th className="text-left p-2">Trạng thái khảo sát</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.Id} className="border-b">
                                        <td className="p-2">{user.Name || user.Username}</td>
                                        <td className="p-2">{user.Email}</td>
                                        <td className="p-2">{user.OrganizationName || "-"}</td>
                                        <td className="p-2">{user.Role}</td>
                                        <td className="p-2">{user.Province || "-"}</td>
                                        <td className="p-2">{user.Ward || "-"}</td>
                                        <td className="p-2">{user.IsMember ? "Có" : "Không"}</td>
                                        <td className="p-2">
                                            {user.SurveyTime !== null ? "Đã hoàn thành" : "Chưa hoàn thành"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Trang trước
                        </Button>
                        <span>
                            Trang {currentPage} / {Math.ceil(totalPages / Config.limit)}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === Math.ceil(totalPages / Config.limit)}
                        >
                            Trang sau
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}