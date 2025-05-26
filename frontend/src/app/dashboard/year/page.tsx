"use client"

import { use, useEffect, useState } from "react"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from 'next/link';
import {
    Button,
} from "@/components/ui/button"
import { useSearchParams } from "next/navigation";
import { Config } from "@/lib/config"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API } from "@/lib/api"
import { toast } from "sonner";
import { ArrowUpDown, Download } from "lucide-react";
import { provinceService } from "@/lib/api";

interface ProvincePoint {
    Id: number
    Name: string
    Region: string
    TotalPoint: number
    TotalUsers: number
    TotalMembers: number
    MembersSurveyed: number
    NonMembersSurveyed: number
    FinalPoint: number
}
type SurveyInfo = {
    Id: number
    Title: string
    Description: string
    Role: string
    Type: string
    StartTime: string
    EndTime: string
    QuestionCount: number
    finishedNum: number
    totalNum: number
}
export default function DashboardYear() {
    const searchParams = useSearchParams();
    const year = Number(searchParams.get("year"));
    const [regionFilter, setRegionFilter] = useState<string>("all");
    const [provincePointList, setProvincePointList] = useState<ProvincePoint[]>([]);
    
    const filteredProvinceList = useMemo(() => {
        if (regionFilter === "all") {
            return provincePointList;
        }
        return provincePointList.filter(province => province.Region === regionFilter);
    }, [provincePointList, regionFilter]);
    const [provincesDisplayLimit, setProvincesDisplayLimit] = useState(10);
    const visibleProvinces = useMemo(() => {
        return filteredProvinceList.slice(0, provincesDisplayLimit);
    }, [filteredProvinceList, provincesDisplayLimit]);
    const [surveyInfo, setSurveyInfo] = useState<SurveyInfo[]>([{
        Id: 0,
        Title: "",
        Description: "",
        Role: "",
        Type: "",
        StartTime: "",
        EndTime: "",
        QuestionCount: 0,
        finishedNum: 0,
        totalNum: 0,
    }]);
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleProvinceView = () => {
        if (isExpanded) {
            setProvincesDisplayLimit(10);
            setIsExpanded(false);
        } else {
            setProvincesDisplayLimit(provincePointList.length);
            setIsExpanded(true);
        }
    };
    const exportProvincesTable = async () => {
        try {
            const columns = [
                { header: 'Tỉnh/Thành phố', key: 'Name', width: 30 },
                { header: 'Vùng', key: 'Region', width: 30 },
                { header: 'Điểm đánh giá', key: 'FinalPoint', width: 20 }
            ];
            
            const data = filteredProvinceList.map(province => ({
                Name: province.Name,
                Region: province.Region,
                FinalPoint: Number(province.FinalPoint).toFixed(2)
            }));
            const response = await provinceService.exportDynamic({
                columns,
                data,
                filename: `thong_ke_tinh_thanh_${year}${regionFilter !== "all" ? `_${regionFilter}` : ""}.xlsx`,
                sheetName: 'Thống kê điểm đánh giá'
            });
            
            // Convert response to blob and download
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `thong_ke_tinh_thanh_${year}${regionFilter !== "all" ? `_${regionFilter}` : ""}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Xuất Excel thành công');
        } catch (error) {
            console.error('Error exporting provinces:', error);
            toast.error('Xuất Excel thất bại');
        }
    };
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const sortProvinceList = (direction: 'asc' | 'desc') => {
        setSortDirection(direction);
        const sorted = [...provincePointList].sort((a, b) =>
            direction === 'asc' ? a.TotalPoint - b.TotalPoint : b.TotalPoint - a.TotalPoint
        );
        setProvincePointList(sorted);
    };
    const uniqueRegions = useMemo(() => {
        const regions = provincePointList.map(province => province.Region);
        return [...new Set(regions)];
    }, [provincePointList]);
    const fetchSurvey = async () => {
        try {
            const query = Cookies.get("userRole") === "LMHTX" ? `&province_id=${Cookies.get("provinceId")}` : "";
            const surveyRes = await fetch(`${API.surveys}/progress?year=${year}${query}`);
            const surveyData = await surveyRes.json();
            setSurveyInfo(surveyData.surveys);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch survey data");
        }
    };
    const fetchInitialData = async () => {
        try {
            const [res1] = await Promise.all([
                fetch(`${API.provinces}`),
            ]);
            const [data1] = await Promise.all([res1.json()]);
            // setProvincesList(data1.items);
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };
    const renderCustomLabel = ({ name , percent }: { name: string; percent: number }) => {
        return `${name}: ${(percent * 100).toFixed(0)}%`;
    };
    const calculateK1 = (surveyed: number, total: number) => {
        if (total === 0) return 0; // Tránh chia cho 0
      
        const rawK1 = (surveyed / total) * 100;
      
        if (total < 500) {
          return rawK1 === 100 ? 1 : rawK1;
        } else if (total < 1000) {
          return rawK1 >= 80 ? 1 : rawK1;
        } else {
          return rawK1 >= 70 ? 1 : rawK1;
        }
    }
    const calculateK2 = (memberCount: number, totalActive: number) => {
        if (totalActive === 0) return 0; // Tránh chia cho 0

        const baseK2 = (memberCount / totalActive) * 100;

        let multiplier = 0;
        if (memberCount < 100) {
            multiplier = 0.6;
        } else if (memberCount < 200) {
            multiplier = 0.7;
        } else if (memberCount < 300) {
            multiplier = 0.8;
        } else if (memberCount < 500) {
            multiplier = 1.0;
        } else if (memberCount < 1000) {
            multiplier = 1.2;
        } else {
            multiplier = 1.4;
        }

        return multiplier;
    }
    const calculateK3 = (nonMemberSurveyedCount: number) => {
        if (nonMemberSurveyedCount === 0) return 0;
        if (nonMemberSurveyedCount < 100) {
            return 5;
        } else if (nonMemberSurveyedCount < 200) {
            return 10;
        } else {
            return 15;
        }
    }
    const fetchProvincePointList = async () => {
        try {
            const res = await fetch(`${API.provinces}/survey-stats?year=${year}`);
            const data = await res.json();
    
            // Tính toán FinalPoint cho từng item
            const updatedData = data.map((item: ProvincePoint) => {
                const sumPoint = item.TotalPoint;
                const n = item.TotalUsers;
                const b = 3;
                const isMemberCount = item.TotalMembers;
                const isMemberFinishedCount = item.MembersSurveyed;
                const notMemberFinishedCount = item.NonMembersSurveyed;
    
                const k1 = calculateK1(isMemberFinishedCount, isMemberCount);
                const k2 = calculateK2(isMemberCount, n);
                const k3 = calculateK3(notMemberFinishedCount);
    
                const finalPoint = n === 0 || b === undefined
                    ? 0
                    : ((sumPoint / (5 * b * n)) * 100 * k1 * k2) + k3;
    
                return {
                    ...item,
                    FinalPoint: finalPoint
                };
            });
    
            // Sắp xếp theo FinalPoint
            updatedData.sort((a: ProvincePoint, b: ProvincePoint) => b.FinalPoint - a.FinalPoint);
    
            // Cập nhật state
            setProvincePointList(updatedData);
        } catch (error) {
            console.error('Failed to fetch province points:', error);
        }
    };
    
    useEffect(() => {
        fetchInitialData();
        if (year) fetchProvincePointList();
    }, [year]);

    useEffect(() => {
        if (year) fetchSurvey();
    }, []);
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
        <main className="p-6 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center">Khảo sát năm {year}</h1>
            {Cookies.get("userRole") === "admin" || Cookies.get("userRole") === "UBKT" ?
            <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Thứ hạng Chỉ số hài lòng</h2>
                <div className="flex gap-4 items-center">
                    <Select
                        name="Region"
                        value={regionFilter}
                        onValueChange={(value) => setRegionFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn Vùng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả các vùng</SelectItem>
                            {uniqueRegions.map((region) => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportProvincesTable}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead className="w-[300px]">Tỉnh/Thành phố</TableHead>
                        <TableHead className="w-[300px]">Thuộc Vùng</TableHead>
                        <TableHead className="w-[200px]">
                            <Button
                                variant="ghost"
                                onClick={() => sortProvinceList(sortDirection === 'asc' ? 'desc' : 'asc')}
                                className="flex items-center space-x-1"
                            >
                                <span>Điểm đánh giá</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleProvinces.map((item, index) => (
                        <TableRow key={item.Id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.Name}</TableCell>
                            <TableCell>{item.Region}</TableCell>
                            <TableCell>{Number(item.FinalPoint).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {filteredProvinceList.length > 10 && (
                <div className="flex justify-center mt-4">
                    <button
                        className="text-blue-600 hover:underline"
                        onClick={toggleProvinceView}>
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                </div>
            )}
            </div>
            : null}
            <div>
                <Button className="mr-2">
                    <Link href={`/dashboard/progress?year=${year}`}>
                        Tiến độ khảo sát
                    </Link>
                </Button>
                <Button className="mr-2">
                    <Link href={`/dashboard/questions?year=${year}`}>
                        Đánh giá từ người dùng
                    </Link>
                </Button>
            </div>
            {surveyInfo.map((item) => (
                <Card className="mb-2" key={item.Id}>
                    <CardHeader><b>{item.Title}</b></CardHeader>
                    <CardContent>
                        <div className="text-red-500">Lĩnh vực: {item.Role==="QTD" ? "Quỹ tín dụng" : item.Type==="PNN" ? "Hợp tác xã Phi Nông Nghiệp" : item.Type==="NN" ? "Hợp tác xã Nông nghiệp" : "Không xác định"}</div>  
                        <div>Bắt đầu: {new Date(item.StartTime).toLocaleString()} - Kết thúc: {new Date(item.EndTime).toLocaleString()}</div>
                        <div>Tiến độ: {item.finishedNum}/{item.totalNum}</div>
                        {item.totalNum === 0 ? <div className="text-red-400">Khảo sát chưa được phân nhóm, vui lòng Truy cập <a href="/admin/surveys" className="text-blue-400 hover:underline">Quản lý Khảo sát</a> để phân nhóm</div> :
                            <ResponsiveContainer width='100%' height={200}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Đã tham gia", value: item.finishedNum },
                                            { name: "Chưa tham gia", value: (item.totalNum - item.finishedNum) },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={50}
                                        fill="#8884d8"
                                        label={renderCustomLabel}
                                    >
                                        <Cell fill="#34d399" />
                                        <Cell fill="#52525b" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>}
                        <div className="text-right">
                            <Link href={`/dashboard/survey?survey_id=${item.Id}`} className="text-blue-600 hover:underline">
                                Chi tiết
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </main>
    )
}