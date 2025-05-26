"use client"

import { use, useEffect, useState } from "react"
import { useMemo } from "react";
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
import Link from 'next/link'
import { Button } from "@/components/ui/button";

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
type MemberInfo = {
    members: number
    nonMembers: number
}
export default function DashboardPage() {
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
        try {
            const yearRes = await fetch(`${API.surveys}/years`);
            const yearData = await yearRes.json();
            setYears(yearData);

            const provinceRes = await fetch(`${API.provinces}/users_num`)
            const provinceData = await provinceRes.json();
            setProvincesInfoList(provinceData);
            setProvincesFilter(provinceData);
            
            const userRes = await fetch(`${API.users}/total-by-member`)
            const userData = await userRes.json();
            setMemberInfo(userData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {
        fetchInfo()
    }, [])

    return (
        <main className="p-6 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center">DASHBOARD</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết Cuộc khảo sát năm:</CardTitle>
                </CardHeader>
                <CardContent>
                    {years.map((item) => (
                        <Button key={item.year} className="mr-2">
                            <Link href={`/dashboard/year?year=${item.year}`}>{item.year}</Link>
                        </Button>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê LM Hợp Tác Xã</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select
                        name="ProvinceId"
                        onValueChange={(value) => commboBoxChange(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={'Tất cả'}>Tất cả</SelectItem>
                            <SelectItem value={'Đã có thành viên'}>Đã có danh sách thành viên</SelectItem>
                            <SelectItem value={'Chưa có thành viên'}>Chưa có danh sách thành viên</SelectItem>
                        </SelectContent>
                    </Select>
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
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
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê Hợp tác xã thành viên</CardTitle>
                </CardHeader>
                <CardContent>
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-left">Tổng: {memberInfo?.members + memberInfo?.nonMembers}</div>
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
