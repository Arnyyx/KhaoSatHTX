"use client"

import { use, useEffect, useState } from "react"
import { useMemo } from "react";
import Link from 'next/link';
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Download } from "lucide-react";
import { provinceService } from "@/lib/api";

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
    SurveyStatus?: boolean | null;
    SurveyTime?: number | null;
    Province?: string  | null;
    Ward?: string  | null;
    Point: number;
}
type ValuePair = {
    Id: number
    Name: string
}
type ProvinceInfo = {
    Id: number
    Name: string
    Region: string
}
type WardInfo = {
  Id: number
  ProvinceId: number
  Name: string
}
type ProvincePoint = {
    Id: number
    Name: string
    Region: string
    Point: number
}
export default function DashboardSurvey() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const survey_id = Number(searchParams.get("survey_id"));

    const [currentPage, setCurrentPage] = useState(page);
    const [totalPages, setTotalPages] = useState(1);
    
    const [filters, setFilters] = useState<{
        ProvinceId?: number;
        WardId?: number;
        SurveyStatus?: boolean;
        IsMember?: boolean;
    }>({});
    const [provincesDisplayLimit, setProvincesDisplayLimit] = useState(10);
    const [isExpanded, setIsExpanded] = useState(false);
    const [surveyInfo, setSurveyInfo] = useState<SurveyInfo[]>([{
        Id: 0,
        Title: "",
        Description: "",
        StartTime: "",
        EndTime: "",
        QuestionCount: 0,
        finishedNum: 0,
        totalNum: 0,
    }]);

    const [provincePointList, setProvincePointList] = useState<ProvincePoint[]>([]);
    const [valuePairList, setValuePairList] = useState<ValuePair[]>([])
    const [provincesList, setProvincesList] = useState<ProvinceInfo[]>([])
    const [allDistricts, setAllWard] = useState<WardInfo[]>([]);
    const [usersList, setUsersList] = useState<User[]>([])
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [regionFilter, setRegionFilter] = useState<string>("all");

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
    const sortProvinceList = (direction: 'asc' | 'desc') => {
        setSortDirection(direction);
        const sorted = [...provincePointList].sort((a, b) =>
            direction === 'asc' ? a.Point - b.Point : b.Point - a.Point
        );
        setProvincePointList(sorted);
    };
    const fetchSurveyAndUsers = async (page: number, currentFilters = filters) => {
        try {
            const query = Cookies.get("userRole") === "LMHTX" ? `&province_id=${Cookies.get("provinceId")}` : "";
            const surveyRes = await fetch(`${API.surveys}/progress?id=${survey_id}${query}`);
            const surveyData = await surveyRes.json();
            setSurveyInfo(surveyData.surveys);
            // Build query parameters for filters
            const queryParams = new URLSearchParams({
                survey_id: survey_id.toString(),
                page: page.toString(),
                limit: Config.limit.toString()
            });

            // Add filters to query parameters if they exist
            if (currentFilters.ProvinceId) queryParams.append('province_id', currentFilters.ProvinceId.toString());
            if (currentFilters.WardId) queryParams.append('ward_id', currentFilters.WardId.toString());
            if (currentFilters.IsMember !== undefined) queryParams.append('is_member', currentFilters.IsMember.toString());
            if (currentFilters.SurveyStatus !== undefined) queryParams.append('survey_status', currentFilters.SurveyStatus.toString());

            if (Cookies.get("userRole") === "LMHTX") {
                queryParams.append('province_id', Cookies.get("provinceId") || "");
            }

            const userRes = await fetch(`${API.users}/survey?${queryParams.toString()}`);
            const userData = await userRes.json();
            console.log('data',userData.items)
            setUsersList(userData.items);
            setTotalPages(userData.total);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch survey data");
        }
    };
    const filterCommboBoxChange = (value: string, name: string) => {
        const newFilters = { ...filters };

        if (name === "ProvinceId") {
            const filteredDistricts = allDistricts.filter(d => d.ProvinceId === Number(value));
            setValuePairList(filteredDistricts); // cập nhật danh sách quận huyện
            newFilters.ProvinceId = value === "all" ? undefined : parseInt(value);
        } else if (name === "WardId") {
            newFilters.WardId = value === "all" ? undefined : parseInt(value);
        } else if (name === "SurveyStatus") {
            newFilters.SurveyStatus = value === "all" ? undefined : value === "true";
        } else if (name === "IsMember") {
            console.log('ismem',value)
            newFilters.IsMember = value === "all" ? undefined : value === "true";
        }

        setFilters(newFilters);
        fetchSurveyAndUsers(1, newFilters); // Reset to first page when filters change
        setCurrentPage(1);
    };
    const pieData = useMemo(() => {
        const participatedCount = surveyInfo.reduce((sum, item) => sum + item.finishedNum, 0);
        const totalCount = surveyInfo.reduce((sum, item) => sum + item.totalNum, 0);
        return [
            { name: "Đã tham gia", value: participatedCount },
            { name: "Chưa tham gia", value: totalCount - participatedCount },
        ];
    }, [surveyInfo]);
    const fetchInitialData = async () => {
        try {
            const query1 = Cookies.get("userRole") === "LMHTX" ? `/${Cookies.get("provinceId")}` : "";
            const res1 = await fetch(`${API.provinces}${query1}`);
            const data1 = await res1.json();
            setProvincesList(data1.items);

            const query2 = Cookies.get("userRole") === "LMHTX" ? `/province/${Cookies.get("provinceId")}` : "";
            const res2 = await fetch(`${API.wards}${query2}`);
            const data2 = await res2.json();
            if (Cookies.get("userRole") !== "LMHTX") {
                setAllWard(data2.items);
            } else if (Cookies.get("userRole") === "LMHTX") {
                setValuePairList(data2.items);
            }
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };
    const fetchProvincePointList = async () => {
        const userRes = await fetch(`${API.users}/survey?survey_id=${survey_id}`);
        const userData = await userRes.json();
        const b = userData.totalQuestion;

        const provincePoints: ProvincePoint[] = await Promise.all(
            provincesList.map(async (item) => {
                const usersInProvince = userData.items.filter((user: User) => user.ProvinceId === item.Id);
                const sumPoint = usersInProvince.reduce((sum: number, user: User) => sum + user.Point, 0);
                const n = usersInProvince.length;
                const isMemberCount = usersInProvince.filter((user: User) => user.IsMember).length;
                const isMemberFinishedCount = usersInProvince.filter((user: User) => user.IsMember && user.SurveyTime !== null).length;
                const notMemberFinishedCount = usersInProvince.filter((user: User) => !user.IsMember && user.SurveyTime !== null).length;

                const k1 = calculateK1(isMemberFinishedCount, isMemberCount);
                const k2 = calculateK2(isMemberCount, n);
                const k3 = calculateK3(notMemberFinishedCount);
                const provincePoint = n===0 ? 0 : b===0 ? 0 : ((sumPoint / (5 * b * n)) * 100 * k1 * k2) + k3;

                return {
                    Id: item.Id,
                    Name: item.Name,
                    Region: item.Region,
                    Point: provincePoint
                };
            })
        );
        setProvincePointList(provincePoints);
        provincePoints.sort((a, b) => b.Point - a.Point);
    };

    useEffect(() => {
        fetchInitialData();
        if (survey_id) fetchProvincePointList();
    }, []);

    useEffect(() => {
        if (survey_id) fetchSurveyAndUsers(currentPage);
    }, [currentPage, survey_id]);
    useEffect(() => {
        if (survey_id && provincesList.length > 0) {
            fetchProvincePointList();
        }
    }, [provincesList, survey_id]);
    

    const toggleProvinceView = () => {
        if (isExpanded) {
            setProvincesDisplayLimit(10);
            setIsExpanded(false);
        } else {
            setProvincesDisplayLimit(provincePointList.length);
            setIsExpanded(true);
        }
    };

    const filteredProvinceList = useMemo(() => {
        if (regionFilter === "all") {
            return provincePointList;
        }
        return provincePointList.filter(province => province.Region === regionFilter);
    }, [provincePointList, regionFilter]);
    const visibleProvinces = useMemo(() => {
        return filteredProvinceList.slice(0, provincesDisplayLimit);
    }, [filteredProvinceList, provincesDisplayLimit]);


    const uniqueRegions = useMemo(() => {
        const regions = provincePointList.map(province => province.Region);
        return [...new Set(regions)];
    }, [provincePointList]);

    const exportProvincesTable = async () => {
        try {
            const columns = [
                { header: 'Tỉnh/Thành phố', key: 'Name', width: 30 },
                { header: 'Vùng', key: 'Region', width: 30 },
                { header: 'Điểm đánh giá', key: 'Point', width: 20 }
            ];
            
            const data = filteredProvinceList.map(province => ({
                Name: province.Name,
                Region: province.Region,
                Point: Number(province.Point).toFixed(2)
            }));
            const response = await provinceService.exportDynamic({
                columns,
                data,
                filename: `thong_ke_tinh_thanh_${survey_id}${regionFilter !== "all" ? `_${regionFilter}` : ""}.xlsx`,
                sheetName: 'Thống kê điểm đánh giá'
            });
            
            // Convert response to blob and download
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `thong_ke_tinh_thanh_${survey_id}${regionFilter !== "all" ? `_${regionFilter}` : ""}.xlsx`;
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
            <h1 className="text-2xl font-bold text-center mb-6">Chi tiết khảo sát</h1>
            {surveyInfo.map((item) => (
            <Card className="mb-6 shadow-lg" key={item.Id}>
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl">{item.Title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-muted-foreground">Mô tả:</p>
                            <p className="font-medium">{item.Description}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground">Thời gian:</p>
                            <p className="font-medium">
                                Từ {new Date(item.StartTime).toLocaleString()} đến {new Date(item.EndTime).toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground">Số câu hỏi:</p>
                            <p className="font-medium">{item.QuestionCount} câu</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground">Tiến độ:</p>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-secondary h-2 rounded-full">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(item.finishedNum / item.totalNum) * 100}%` }}
                                    />
                                </div>
                                <span className="font-medium whitespace-nowrap">{item.finishedNum}/{item.totalNum}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            ))}
            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">Danh sách người dùng</TabsTrigger>
                    {Cookies.get("userRole") === "admin" || Cookies.get("userRole") === "UBKT" ?
                    <TabsTrigger value="provinces">Thứ hạng Chỉ số hài lòng</TabsTrigger>
                    : null}
                </TabsList>
                <TabsContent value="users">
                    <h2 className="text-lg font-semibold mb-4">Tỷ lệ HTX tham gia khảo sát</h2>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Bộ lọc</span>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setFilters({});
                                        fetchSurveyAndUsers(1, {});
                                        setCurrentPage(1);
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Cookies.get("userRole") === "admin" || Cookies.get("userRole") === "UBKT" ?
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tỉnh/Thành phố</label>
                                    <Select
                                        name="ProvinceId"
                                        onValueChange={(value) => filterCommboBoxChange(value, "ProvinceId")}
                                        value={filters.ProvinceId?.toString() || "all"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            {provincesList.map((item) => (
                                                <SelectItem key={item.Id} value={String(item.Id)}>{item.Name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                : <div className="space-y-2">
                                    {provincesList.map((item) => (
                                        <label key={item.Id} className="text-sm font-medium">Tỉnh {item.Name}</label>
                                    ))}
                                </div>
                                    }
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quận/Huyện</label>
                                    <Select
                                        name="WardId"
                                        onValueChange={(value) => filterCommboBoxChange(value, "WardId")}
                                        value={filters.WardId?.toString() || "all"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn Quận/Huyện" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            {valuePairList.map((item) => (
                                                <SelectItem key={item.Id} value={String(item.Id)}>{item.Name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Thành viên</label>
                                    <Select
                                        name="IsMember"
                                        onValueChange={(value) => filterCommboBoxChange(value, "IsMember")}
                                        value={filters.IsMember?.toString() || "all"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="true">Là thành viên</SelectItem>
                                            <SelectItem value="false">Không phải thành viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tiến độ</label>
                                    <Select
                                        name="SurveyStatus"
                                        onValueChange={(value) => filterCommboBoxChange(value, "SurveyStatus")}
                                        value={filters.SurveyStatus?.toString() || "all"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tiến độ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="true">Đã tham gia</SelectItem>
                                            <SelectItem value="false">Chưa tham gia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label={renderCustomLabel}
                            >
                                <Cell fill="#34d399" />
                                <Cell fill="#52525b" />
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">Danh sách người dùng</h3>
                            <span className="text-sm text-muted-foreground">({totalPages} bản ghi)</span>
                        </div>
                        <Button 
                            onClick={() => window.open(`${API.users}/export_filter?province_id=${Cookies.get("userRole") === "LMHTX" ? Cookies.get("provinceId") : filters.ProvinceId}&ward_id=${filters.WardId}&survey_status=${filters.SurveyStatus}&survey_id=${survey_id}&is_member=${filters.IsMember}`, "_blank")}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Xuất Excel
                        </Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Tên tổ chức</TableHead>
                                    <TableHead className="w-[200px]">Họ Tên</TableHead>
                                    <TableHead className="w-[150px]">Điểm Đánh giá</TableHead>
                                    <TableHead className="w-[150px]">Tỉnh/Thành phố</TableHead>
                                    <TableHead className="w-[150px]">Phường/Xã</TableHead>
                                    <TableHead className="w-[200px]">Địa chỉ</TableHead>
                                    <TableHead className="w-[150px]">Số điện thoại</TableHead>
                                    <TableHead className="w-[200px]">Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usersList.map((item) => (
                                        <TableRow key={item.Id}>
                                            <TableCell className="font-medium">{item.OrganizationName}</TableCell>
                                            <TableCell>{item.Name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.Point >= 8 ? 'bg-green-100 text-green-800' :
                                                    item.Point >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {Number(item.Point).toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{item.Province}</TableCell>
                                            <TableCell>{item.Ward}</TableCell>
                                            <TableCell>{item.Address}</TableCell>
                                            <TableCell>{item.Username}</TableCell>
                                            <TableCell>{item.Email}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <Button
                            size='sm'
                            variant="outline"
                            disabled={currentPage <= 1}
                            onClick={() => {
                                setCurrentPage(currentPage - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Trang trước
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Trang {currentPage} / {Math.ceil(totalPages / Config.limit)}
                        </div>

                        <Button
                            size='sm'
                            variant="outline"
                            disabled={currentPage >= (Math.ceil(totalPages / Config.limit))}
                            onClick={() => {
                                setCurrentPage(currentPage + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Trang sau
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="provinces">
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">Thứ hạng Chỉ số hài lòng</h2>
                            <p className="text-sm text-muted-foreground">
                                Xếp hạng các tỉnh/thành phố dựa trên chỉ số hài lòng của người dùng
                            </p>
                        </div>
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">STT</TableHead>
                                    <TableHead className="w-[300px]">Tỉnh/Thành phố</TableHead>
                                    <TableHead className="w-[200px]">Thuộc Vùng</TableHead>
                                    <TableHead className="w-[200px]">
                                        <Button
                                            variant="ghost"
                                            onClick={() => sortProvinceList(sortDirection === 'asc' ? 'desc' : 'asc')}
                                            className="flex items-center space-x-1 hover:bg-transparent"
                                        >
                                            <span>Điểm đánh giá</span>
                                            <ArrowUpDown className="h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleProvinces.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    visibleProvinces.map((item, index) => (
                                        <TableRow key={item.Id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.Name}</TableCell>
                                            <TableCell>{item.Region}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.Point >= 8 ? 'bg-green-100 text-green-800' :
                                                    item.Point >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {Number(item.Point).toFixed(2)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredProvinceList.length > 10 && (
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="ghost"
                                onClick={toggleProvinceView}
                                className="text-primary hover:text-primary/80"
                            >
                                {isExpanded ? "Thu gọn" : "Xem thêm"}
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </main>
    )
}