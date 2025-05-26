    "use client"

    import { use, useEffect, useState } from "react"
    import { useMemo } from "react";
    import {
        BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
        PieChart, Pie, Cell, Legend
    } from "recharts"
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from "@/components/ui/table";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
    import { API } from "@/lib/api"
    import Link from 'next/link'
    import { Button } from "@/components/ui/button";
    import { Loader2, RefreshCw } from "lucide-react"
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
    import { AlertCircle } from "lucide-react"
    import Cookies from "js-cookie";
    import { useRouter } from "next/navigation";
    import { toast } from "sonner";
    type ProvinceInfo = {
        Id: number
        Name: string
        UsersNum: number
    }
    type MemberInfo = {
        members: number
        nonMembers: number
    }
    type ProvinceRanking = {
        Id: number
        Name: string
        Region: string
        FirstSurveyTime: string
        TotalUsers: number
        TotalMembers: number
    }
    type ProvinceSurveyStats = {
        CompletedProvinces: number
        UncompletedProvinces: number
    }

    export default function DashboardPage() {
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [roleInfo, setRoleInfo] = useState<{ name: string, UserNum: number }[]>([]);
        const [provinceRankings, setProvinceRankings] = useState<ProvinceRanking[]>([]);
        const [provinceSurveyStats, setProvinceSurveyStats] = useState<ProvinceSurveyStats>({ CompletedProvinces: 0, UncompletedProvinces: 0 });
        const chartData = useMemo(() => {
            return roleInfo?.map(survey => ({
                name: survey.name,
                UserNum: survey.UserNum,
            }));
        }, [roleInfo]);
        const [showProvincesAll, setShowProvincesAll] = useState(false);

        const [years, setYears] = useState<{ year: number }[]>([]);
        const [provincesInfoList, setProvincesInfoList] = useState<ProvinceInfo[]>([])
        const [provincesFilter, setProvincesFilter] = useState<ProvinceInfo[]>([])
        const [memberInfo, setMemberInfo] = useState<MemberInfo>()

        const visibleProvinces = showProvincesAll ? provincesFilter : provincesFilter.slice(0, 3);
        const commboBoxChange = (value: string) => {
            if(value === 'Tất cả') {
                setProvincesFilter(provincesInfoList)
            } else if(value === 'Đã có thành viên') {
                setProvincesFilter(provincesInfoList.filter(item => item.UsersNum > 0))
            } else if(value === 'Chưa có thành viên') {
                setProvincesFilter(provincesInfoList.filter(item => item.UsersNum === 0))
            }
        };
        const renderCustomLabel = ({ name , percent }: { name: string; percent: number }) => {
            return `${name}: ${(percent * 100).toFixed(0)}%`;
        };
        const fetchInfo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const query = Cookies.get("userRole") === "LMHTX" ? `?province_id=${Cookies.get("provinceId")}` : "";
                const [yearRes, provinceRes, userRes, roleRes, rankingsRes] = await Promise.all([
                    fetch(`${API.surveys}/years`),
                    fetch(`${API.provinces}/users_num`),
                    fetch(`${API.users}/total-by-member${query}`),
                    fetch(`${API.users}/role_number${query}`),
                    fetch(`${API.provinces}/rankings`)
                ]);

                if (!yearRes.ok || !provinceRes.ok || !userRes.ok || !roleRes.ok || !rankingsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [yearData, provinceData, userData, roleData, rankingsData] = await Promise.all([
                    yearRes.json(),
                    provinceRes.json(),
                    userRes.json(),
                    roleRes.json(),
                    rankingsRes.json()
                ]);

                setYears(yearData);
                setProvincesInfoList(provinceData);
                setProvincesFilter(provinceData);
                setMemberInfo(userData);
                setRoleInfo(roleData);
                setProvinceRankings(rankingsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };
        useEffect(() => {
            fetchInfo()
        }, [])
        useEffect(() => {
            setProvinceSurveyStats({ CompletedProvinces: provinceRankings.filter(item => item.FirstSurveyTime !== null).length, UncompletedProvinces: provinceRankings.filter(item => item.FirstSurveyTime === null).length });
        }, [provinceRankings])

        const COLORS = ['#34d399', '#52525b', '#3b82f6', '#f59e0b', '#ef4444'];

        const formatNumber = (num: number) => {
            return new Intl.NumberFormat('vi-VN').format(num);
        };
        
        if (error) {
            return (
                <main className="p-6 max-w-4xl mx-auto">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button 
                        className="mt-4"
                        onClick={fetchInfo}
                        variant="outline"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Thử lại
                    </Button>
                </main>
            );
        }
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
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">DASHBOARD</h1>
                    <Button 
                        onClick={fetchInfo}
                        disabled={isLoading}
                        variant="outline"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Làm mới
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        {Cookies.get("userRole") === "admin" || Cookies.get("userRole") === "UBKT" ? 
                            <Card>
                                <CardHeader>
                                <CardTitle>Tổng quan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800">Tổng số tỉnh</h3>
                                        <p className="text-2xl font-bold text-blue-900">{formatNumber(provincesInfoList.length)}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-green-800">Tổng số HTX</h3>
                                        <p className="text-2xl font-bold text-green-900">{formatNumber((memberInfo?.members || 0) + (memberInfo?.nonMembers || 0))}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-purple-800">Tỉnh đã hoàn thành</h3>
                                        <p className="text-2xl font-bold text-purple-900">{formatNumber(provinceSurveyStats.CompletedProvinces)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        : null}


                        <Card>
                            <CardHeader>
                                <CardTitle>Chi tiết Cuộc khảo sát năm:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {years.map((item) => (
                                        <Button key={item.year} variant="outline" className="hover:bg-blue-50">
                                            <Link href={`/dashboard/year?year=${item.year}`}>{item.year}</Link>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {Cookies.get("userRole") === "admin" || Cookies.get("userRole") === "UBKT" ? 
                        <Card>
                            <CardHeader>
                                <CardTitle>Thống kê LM Hợp Tác Xã</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    name="ProvinceId"
                                    onValueChange={(value) => commboBoxChange(value)}
                                >
                                    <SelectTrigger className="w-[280px]">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={'Tất cả'}>Tất cả</SelectItem>
                                        <SelectItem value={'Đã có thành viên'}>Đã có danh sách thành viên</SelectItem>
                                        <SelectItem value={'Chưa có thành viên'}>Chưa có danh sách thành viên</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="mt-6">
                                    <ResponsiveContainer width='100%' height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Đã có danh sách thành viên", value: provincesInfoList.filter(item => item.UsersNum > 0).length },
                                                    { name: "Chưa có danh sách thành viên", value: provincesInfoList.filter(item => item.UsersNum === 0).length },
                                                ]}
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
                                            <Tooltip 
                                                formatter={(value: number) => [`${value} tỉnh`, 'Số lượng']}
                                                contentStyle={{ 
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '8px'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px]">Liên minh Tỉnh</TableHead>
                                                <TableHead className="w-[100px] text-right">Số thành viên</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {visibleProvinces.map((item) => (
                                                <TableRow key={item.Id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">{item.Name}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(item.UsersNum)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {provincesFilter.length > 3 && (
                                        <div className="mt-4 text-center">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowProvincesAll(!showProvincesAll)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {showProvincesAll ? "Thu gọn" : "Xem thêm"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        : null}

                        <Card>
                            <CardHeader>
                                <CardTitle>Thống kê Hợp tác xã thành viên</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-6">
                                    <ResponsiveContainer width='100%' height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Hợp tác xã thành viên", value: memberInfo?.members },
                                                    { name: "Hợp tác xã không thành viên", value: memberInfo?.nonMembers },
                                                ]}
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
                                            <Tooltip 
                                                formatter={(value: number) => [`${formatNumber(value)} HTX`, 'Số lượng']}
                                                contentStyle={{ 
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '8px'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 text-right text-lg font-semibold">
                                    Tổng: {formatNumber((memberInfo?.members || 0) + (memberInfo?.nonMembers || 0))} HTX
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Thống kê loại hình Hợp tác xã</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fill: '#374151' }}
                                            tickLine={{ stroke: '#9ca3af' }}
                                        />
                                        <YAxis 
                                            label={{ 
                                                value: "Số lượng", 
                                                angle: -90, 
                                                position: "insideLeft",
                                                style: { fill: '#374151' }
                                            }}
                                            tick={{ fill: '#374151' }}
                                            tickLine={{ stroke: '#9ca3af' }}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => [`${formatNumber(value)} người`, 'Số lượng']}
                                            contentStyle={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: '8px'
                                            }}
                                        />
                                        <Bar 
                                            dataKey="UserNum" 
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        {Cookies.get("userRole") === "admin" || Cookies.get("userRole") === "UBKT" ? 
                            <Card>
                                <CardHeader>
                                    <CardTitle>Xếp hạng tỉnh theo thời gian hoàn thành khảo sát</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Card className="mb-6">
                                        <CardHeader>
                                            <CardTitle>Thống kê hoàn thành khảo sát theo tỉnh</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-green-50 rounded-lg">
                                                    <h3 className="text-lg font-semibold text-green-800">Đã hoàn thành</h3>
                                                    <p className="text-2xl font-bold text-green-900">{formatNumber(provinceSurveyStats.CompletedProvinces)} tỉnh</p>
                                                </div>
                                                <div className="p-4 bg-red-50 rounded-lg">
                                                    <h3 className="text-lg font-semibold text-red-800">Chưa hoàn thành</h3>
                                                    <p className="text-2xl font-bold text-red-900">{formatNumber(provinceSurveyStats.UncompletedProvinces)} tỉnh</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">STT</TableHead>
                                            <TableHead>Tỉnh/Thành phố</TableHead>
                                            <TableHead>Vùng miền</TableHead>
                                            <TableHead>Thời gian hoàn thành</TableHead>
                                            <TableHead className="text-right">Số thành viên</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {provinceRankings
                                            .filter(province => province.FirstSurveyTime !== null)
                                            .map((province, index) => (
                                                <TableRow key={province.Id} className="hover:bg-gray-50">
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{province.Name}</TableCell>
                                                    <TableCell>{province.Region}</TableCell>
                                                    <TableCell>{new Date(province.FirstSurveyTime).toLocaleString('vi-VN')}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(province.TotalMembers)}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        : null}
                    </>
                )}
            </main>
        )
    }
