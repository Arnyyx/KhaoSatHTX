"use client"

import {
    Button,
} from "@/components/ui/button"
import { useState } from "react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DashboardPage() {
    const totalHTX = 12
    const participatedHTX = 8
    const [surveyLocked, setSurveyLocked] = useState(false)

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
            <h1 className="text-2xl font-bold text-center">UI Components Showcase</h1>

            {/* Buttons */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Buttons</h2>
                <div className="flex gap-2 flex-wrap">
                    <Button>Default</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </section>

            {/* Card */}
            <section>
                <h2 className="text-lg font-semibold mb-2">Card</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê HTX</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Đã tham gia khảo sát: <strong>8</strong> / 12</p>
                    </CardContent>
                </Card>
            </section>

            {/* Input + Switch */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Input & Switch</h2>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="you@example.com" />
                </div>
                <div className="flex items-center gap-4">
                    <Label htmlFor="toggle">Khảo sát</Label>
                    <Switch id="toggle" />
                </div>
            </section>

            {/* Tabs */}
            <section>
                <h2 className="text-lg font-semibold mb-2">Tabs</h2>
                <Tabs defaultValue="htx">
                    <TabsList>
                        <TabsTrigger value="htx">HTX</TabsTrigger>
                        <TabsTrigger value="union">Liên minh</TabsTrigger>
                    </TabsList>
                    <TabsContent value="htx">Danh sách HTX</TabsContent>
                    <TabsContent value="union">Thông tin liên minh</TabsContent>
                </Tabs>
            </section>

            {/* Badge + Alert */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Badge & Alert</h2>
                <div className="flex gap-2">
                    <Badge>Đã tham gia</Badge>
                    <Badge variant="destructive">Chưa tham gia</Badge>
                </div>
                <Alert>
                    <AlertTitle>Cảnh báo</AlertTitle>
                    <AlertDescription>Số lượng HTX chưa tham gia còn nhiều.</AlertDescription>
                </Alert>
            </section>

            {/* Avatar */}
            <section>
                <h2 className="text-lg font-semibold mb-2">Avatar</h2>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>HTX</AvatarFallback>
                </Avatar>
            </section>

            {/* Dialog */}
            <section>
                <h2 className="text-lg font-semibold mb-2">Dialog</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Hiện hộp thoại</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thông báo</DialogTitle>
                        </DialogHeader>
                        <p>Đây là nội dung dialog, dùng để xác nhận hoặc hiển thị thông tin.</p>
                    </DialogContent>
                </Dialog>
            </section>
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Tỷ lệ HTX tham gia khảo sát</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: "Đã tham gia", value: participatedHTX },
                                    { name: "Chưa tham gia", value: totalHTX - participatedHTX },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label
                            >
                                <Cell fill="#34d399" />
                                <Cell fill="#52525b" />
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Biểu đồ cột */}
            <Card>
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
            </Card>

            {/* Xếp hạng theo thời gian */}
            <Card>
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
            </Card>
        </main>
    )
}
