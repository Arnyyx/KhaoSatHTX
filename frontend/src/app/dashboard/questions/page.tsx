"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API } from "@/lib/api"
import { toast } from "sonner"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from "recharts"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface QuestionStats {
    QuestionId: number
    QuestionContent: string
    SurveyId: number
    SurveyTitle: string
    NotSatisfied: number
    PartiallySatisfied: number
    Satisfied: number
    TotalAnswers: number
    NotSatisfiedPercent: string
    PartiallySatisfiedPercent: string
    SatisfiedPercent: string
}

interface Survey {
    Id: number
    Title: string
}

interface PaginationInfo {
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function DashboardQuestions() {
    const searchParams = useSearchParams();
    const year = Number(searchParams.get("year")) || new Date().getFullYear();
    const [stats, setStats] = useState<QuestionStats[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<string>("");
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    useEffect(() => {
        fetchSurveys();
    }, [year]);

    useEffect(() => {
        fetchQuestionStats();
    }, [year, selectedSurvey, pagination.page]);

    const fetchSurveys = async () => {
        try {
            const query = Cookies.get("userRole") === "LMHTX" ? `&province_id=${Cookies.get("provinceId")}` : "";
            const response = await fetch(`${API.surveys}/progress?year=${year}${query}`);
            const data = await response.json();
            setSurveys(data.surveys);
            if (data.surveys && data.surveys.length > 0) {
                setSelectedSurvey(data.surveys[0].Id.toString());
            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
            toast.error("Failed to fetch surveys");
        }
    };

    const fetchQuestionStats = async () => {
        try {
            const queryParams = new URLSearchParams({
                year: year.toString(),
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });
            
            if (selectedSurvey) {
                queryParams.append('survey_id', selectedSurvey);
            }
            if (Cookies.get("userRole") === "LMHTX") {
                queryParams.append('province_id', Cookies.get("provinceId") || "");
            }
            const response = await fetch(`${API.surveys}/question-stats?${queryParams.toString()}`);
            const data = await response.json();
            setStats(data.stats);
            setPagination({
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages
            });
        } catch (error) {
            console.error("Error fetching question stats:", error);
            toast.error("Failed to fetch question statistics");
        }
    };

    const chartData = stats.map(stat => ({
        name: stat.QuestionContent,
        "Không hài lòng": parseFloat(stat.NotSatisfiedPercent) || 0,
        "Chưa hoàn toàn hài lòng": parseFloat(stat.PartiallySatisfiedPercent) || 0,
        "Hài lòng": parseFloat(stat.SatisfiedPercent) || 0
    }));

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
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
                <h1 className="text-2xl font-bold">Thống kê câu trả lời năm {year}</h1>
                <Select
                    value={selectedSurvey}
                    onValueChange={setSelectedSurvey}
                >
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Chọn khảo sát" />
                    </SelectTrigger>
                    <SelectContent>
                        {surveys.map((survey) => (
                            <SelectItem key={survey.Id} value={survey.Id.toString()}>
                                {survey.Title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Phân bố câu trả lời theo câu hỏi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px]">
                        {chartData && chartData.length > 0 ? (
                            <div className="w-full h-full">
                                <ResponsiveContainer>
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                                        barSize={20}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                            interval={0}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => {
                                                if (value.length > 50) {
                                                    return value.substring(0, 50) + '...';
                                                }
                                                return value;
                                            }}
                                        />
                                        <YAxis
                                            label={{ value: 'Phần trăm (%)', angle: -90, position: 'insideLeft' }}
                                            domain={[0, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value}%`, '']}
                                            labelFormatter={(label) => {
                                                const stat = stats.find(s => s.QuestionContent === label);
                                                return stat ? stat.QuestionContent : label;
                                            }}
                                        />
                                        <Legend />
                                        <Bar 
                                            dataKey="Không hài lòng" 
                                            stackId="a" 
                                            fill="#ef4444"
                                            name="Không hài lòng"
                                        />
                                        <Bar 
                                            dataKey="Chưa hoàn toàn hài lòng" 
                                            stackId="a" 
                                            fill="#f59e0b"
                                            name="Chưa hoàn toàn hài lòng"
                                        />
                                        <Bar 
                                            dataKey="Hài lòng" 
                                            stackId="a" 
                                            fill="#22c55e"
                                            name="Hài lòng"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Chi tiết câu trả lời</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Khảo sát</th>
                                    <th className="text-left p-2">Câu hỏi</th>
                                    <th className="text-left p-2">Không hài lòng</th>
                                    <th className="text-left p-2">Chưa hoàn toàn hài lòng</th>
                                    <th className="text-left p-2">Hài lòng</th>
                                    <th className="text-left p-2">Tổng số câu trả lời</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((stat) => (
                                    <tr key={stat.QuestionId} className="border-b">
                                        <td className="p-2">{stat.SurveyTitle}</td>
                                        <td className="p-2">{stat.QuestionContent}</td>
                                        <td className="p-2">{stat.NotSatisfiedPercent}% ({stat.NotSatisfied})</td>
                                        <td className="p-2">{stat.PartiallySatisfiedPercent}% ({stat.PartiallySatisfied})</td>
                                        <td className="p-2">{stat.SatisfiedPercent}% ({stat.Satisfied})</td>
                                        <td className="p-2">{stat.TotalAnswers}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm">
                                Trang {pagination.page} / {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
