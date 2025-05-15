"use client"

import { use, useEffect, useState } from "react"
import { useMemo } from "react";
import {
    Button,
} from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { API } from "@/lib/api"
import { all } from "axios";

type SurveyInfo = {
    Id: number
    Title: string
    Description: string
    StartTime: string
    EndTime: string
    finishedNum: number
    totalNum: number
}
type ProvinceInfo = {
    Id: number
    Name: string
    UsersNum: number
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
    Province?: { Name: string } | null;
    Ward?: { Name: string } | null;
}
type ValuePair = {
    Id: number
    Name: string
}
type WardInfo = {
  Id: number
  ProvinceId: number
  Name: string
}
export default function DashboardPage() {
    const [filters, setFilters] = useState<{
        ProvinceId?: number;
        WardId?: number;
        Role?: User["Role"];
        Type?: User["Type"];
        SurveyStatus?: boolean;
    }>({});
    const [showProvincesAll, setShowProvincesAll] = useState(false);
    const [showUsersAll, setShowUsersAll] = useState(false);

    const [surveysInfoList, setSurveysInfoList] = useState<SurveyInfo[]>([])
    const [provincesInfoList, setProvincesInfoList] = useState<ProvinceInfo[]>([])
    const [provincesFilter, setProvincesFilter] = useState<ProvinceInfo[]>([])
    const [valuePairList, setValuePairList] = useState<ValuePair[]>([])
    const [valuePairList0, setValuePairList0] = useState<ValuePair[]>([])
    const [allDistricts, setAllWard] = useState<WardInfo[]>([]);
    const [usersList, setUsersList] = useState<User[]>([])
    
    const visibleProvinces = showProvincesAll ? provincesFilter : provincesFilter.slice(0, 3);
    const visibleUsers = showUsersAll ? usersList : usersList.slice(0, 3); 
    const [allUsersList, setAllUsersList] = useState<User[]>([])
    // const [participatedHTX, setParticipatedHTX] = useState(0)
    const [totalHTX, setTotalHTX] = useState(0)
    
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
    const filterCommboBoxChange = (value: string, name: string) => {
        const newFilters = { ...filters };

        if (name === "ProvinceId") {
            const filteredDistricts = allDistricts.filter(d => d.ProvinceId === Number(value));
            setValuePairList(filteredDistricts); // cập nhật danh sách quận huyện
            newFilters.ProvinceId = value === "all" ? undefined : parseInt(value);
        } else if (name === "WardId") {
            newFilters.WardId = value === "all" ? undefined : parseInt(value);
        } else if (name === "Role") {
            if (value === "all") {newFilters.Role = undefined; newFilters.Type = undefined;}
            else if (value === "HTX_NN") {newFilters.Role = "HTX"; newFilters.Type = "NN";}
            else if (value === "HTX_PNN") {newFilters.Role = "HTX"; newFilters.Type = "PNN";}
            else if (value === "QTD") {newFilters.Role = "QTD"; newFilters.Type = undefined;}
            else if (value === "LMHTX") {newFilters.Role = "LMHTX"; newFilters.Type = undefined;}
            else if (value === "admin") {newFilters.Role = "admin"; newFilters.Type = undefined;}
        } else if (name === "SurveyStatus") {
            if (value === "all") newFilters.SurveyStatus = undefined;
            else newFilters.SurveyStatus = value === "true";
        }

        setFilters(newFilters);
        filterUsers(newFilters);
    };

    const filterUsers = (currentFilters: typeof filters) => {
        const filtered = allUsersList.filter((user) => {
            return (
                (currentFilters.ProvinceId === undefined || user.ProvinceId === currentFilters.ProvinceId) &&
                (currentFilters.WardId === undefined || user.WardId === currentFilters.WardId) &&
                (currentFilters.Role === undefined || user.Role === currentFilters.Role) &&
                (currentFilters.Type === undefined || user.Type === currentFilters.Type) &&
                (currentFilters.SurveyStatus === undefined || user.SurveyStatus === currentFilters.SurveyStatus)
            );
        });
        setUsersList(filtered);
        console.log("Filtered Users:", filtered);
    };
    const pieData = useMemo(() => {
        const participatedCount = usersList.filter((user: User) => user.SurveyStatus).length;
        const totalCount = usersList.length;
        setTotalHTX(totalCount);
        return [
            { name: "Đã tham gia", value: participatedCount },
            { name: "Chưa tham gia", value: totalCount - participatedCount },
        ];
    }, [usersList]);

    const fetchInfo = async () => {
        try {
            const surveyRes = await fetch(`${API.surveys}/progress`);
            const surveyData = await surveyRes.json();
            setSurveysInfoList(surveyData.survey)

            const provinceRes = await fetch(`${API.provinces}/users_num`)
            const provinceData = await provinceRes.json();
            setProvincesInfoList(provinceData);
            setProvincesFilter(provinceData);
            
            const userRes = await fetch(`${API.users}`)
            const userData = await userRes.json();
            setUsersList(userData.items);
            setAllUsersList(userData.items);
            // const participatedCount = userData.filter((user: User) => user.SurveyStatus).length;
            // const totalCount = userData.length;
            // setParticipatedHTX(participatedCount);
            // setTotalHTX(totalCount);

            const res1 = await fetch(`${API.wards}/parent_list`)
            const data1 = await res1.json()
            setValuePairList0(data1)

            const res2 = await fetch(`${API.wards}`)
            const data2 = await res2.json()
            console.log("Ward data:", data2)
            setAllWard(data2.items)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {
        fetchInfo()
    }, [])

    const htxSurveyData = [
        { name: "HTX A", timestamp: "2025-04-23T08:30:00Z" },
        { name: "HTX B", timestamp: "2025-04-23T09:00:00Z" },
        { name: "HTX C", timestamp: "2025-04-23T07:45:00Z" },
        { name: "HTX D", timestamp: "2025-04-23T08:50:00Z" },
    ]

    const chartData = htxSurveyData.map((htx) => {
        const date = new Date(htx.timestamp)
        const timeInMinutes = date.getHours() * 60 + date.getMinutes()
        return {
            name: htx.name,
            time: timeInMinutes,
        }
    })
    const rankedHTX = [...htxSurveyData].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    return (
        <main className="p-6 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center">DASHBOARD</h1>
            <Card>
                    <CardHeader>
                        <CardTitle>Thống kê Cuộc khảo sát</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {surveysInfoList.map((item) => (
                            <Card className="mb-2" key={item.Id}>
                                <CardHeader><b>{item.Title}</b></CardHeader>
                                <CardContent>
                                    <div>Mô tả: {item.Description}</div>
                                    <div>Bắt đầu: {new Date(item.StartTime).toLocaleString()} - Kết thúc: {new Date(item.EndTime).toLocaleString()}</div>
                                    <div>Tiến độ: {item.finishedNum}/{item.totalNum}</div>
                                    <ResponsiveContainer width='100%' height={150}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Đã tham gia", value: item.finishedNum },
                                                    { name: "Chưa tham gia", value: item.totalNum - item.finishedNum },
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
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
            </Card>
            {/* Card */}
            <section>
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê thành viên LM Hợp Tác Xã</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            name="ProvinceId"
                            onValueChange={(value) => commboBoxChange(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'Tất cả'}>Tất cả</SelectItem>
                                <SelectItem value={'Đã có thành viên'}>Đã có danh sách thành viên</SelectItem>
                                <SelectItem value={'Chưa có thành viên'}>Chưa có danh sách thành viên</SelectItem>
                            </SelectContent>
                        </Select>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Liên minh Tỉnh</TableHead>
                                    <TableHead className="w-[100px]">Số thành viên</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleProvinces.map((item) => (
                                    <TableRow key={item.Id}>
                                        <TableCell>{item.Name}</TableCell>
                                        <TableCell>{item.UsersNum}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {provincesFilter.length > 10 && (
                            <div className="mt-4 text-center">
                                <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => setShowProvincesAll(!showProvincesAll)}
                                >
                                    {showProvincesAll ? "Thu gọn" : "Xem thêm"}
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
            
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Tỷ lệ HTX tham gia khảo sát</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lọc</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-row gap-4">
                            <Select
                                name="ProvinceId"
                                onValueChange={(value) => filterCommboBoxChange(value, "ProvinceId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {valuePairList0.map((item) => (
                                        <SelectItem key={item.Id} value={String(item.Id)}>{item.Name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                name="WardId"
                                onValueChange={(value) => filterCommboBoxChange(value, "WardId")}
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
                            <Select
                                name="Role"
                                onValueChange={(value) => filterCommboBoxChange(value, "Role")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Nhóm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="HTX_NN">Hợp tác xã Nông nghiệp</SelectItem>
                                    <SelectItem value="HTX_PNN">Hợp tác xã Phi nông nghiệp</SelectItem>
                                    <SelectItem value="QTD">Quỹ tín dụng</SelectItem>
                                    <SelectItem value="LMHTX">Liên minh hợp tác xã</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                name="SurveyStatus"
                                onValueChange={(value) => filterCommboBoxChange(value, "SurveyStatus")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tiến độ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="true">Đã tham gia</SelectItem>
                                    <SelectItem value="false">Chưa tham gia</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <label>Tổng số: {totalHTX}</label>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Tên tổ chức</TableHead>
                                <TableHead className="w-[200px]">Họ Tên</TableHead>
                                <TableHead className="w-[200px]">Tỉnh/Thành phố</TableHead>
                                <TableHead className="w-[200px]">Phường/Xã</TableHead>
                                <TableHead className="w-[200px]">Địa chỉ</TableHead>
                                <TableHead className="w-[200px]">Số điện thoại</TableHead>
                                <TableHead className="w-[200px]">Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleUsers.map((item) => (
                                <TableRow key={item.Id}>
                                    <TableCell>{item.OrganizationName}</TableCell>
                                    <TableCell>{item.Name}</TableCell>
                                    <TableCell>{item.Province?.Name}</TableCell>
                                    <TableCell>{item.Ward?.Name}</TableCell>
                                    <TableCell>{item.Address}</TableCell>
                                    <TableCell>{item.Username}</TableCell>
                                    <TableCell>{item.Email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {usersList.length > 10 && (
                        <div className="mt-4 text-center">
                            <button
                                className="text-blue-600 hover:underline"
                                onClick={() => setShowUsersAll(!showUsersAll)}
                            >
                                {showUsersAll ? "Thu gọn" : "Xem thêm"}
                            </button>
                        </div>
                    )}
                    <div>
                        <Button onClick={() => window.open(`${API.users}/export_filter?province_id=${filters.ProvinceId}&ward_id=${filters.WardId}&role=${filters.Role}&type=${filters.Type}&survey_status=${filters.SurveyStatus}`, "_blank")}>
                            Xuất Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Biểu đồ cột */}
            {/* <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Thời gian tham gia khảo sát (theo phút trong ngày)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: "Phút", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Bar dataKey="time" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card> */}

            {/* Xếp hạng theo thời gian */}
            {/* <Card>
                <CardContent className="p-6 space-y-2">
                    <h2 className="text-lg font-semibold">Danh sách HTX đã tham gia (xếp theo thời gian)</h2>
                    <ul className="space-y-1 list-decimal list-inside">
                        {rankedHTX.map((htx) => (
                            <li key={htx.name}>
                                <span className="font-medium">{htx.name}</span> – {new Date(htx.timestamp).toLocaleTimeString()}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card> */}
        </main>
    )
}
