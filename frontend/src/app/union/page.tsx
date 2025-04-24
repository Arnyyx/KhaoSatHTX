"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

export default function UnionPage() {
    const [surveyLocked, setSurveyLocked] = useState(false)

    // Giả lập dữ liệu
    const totalHTX = 12
    const participatedHTX = 8
    const htxSurveyData = [
        { name: "HTX A", timestamp: "2025-04-23T08:30:00Z" },
        { name: "HTX B", timestamp: "2025-04-23T09:00:00Z" },
        { name: "HTX C", timestamp: "2025-04-23T07:45:00Z" },
        { name: "HTX D", timestamp: "2025-04-23T08:50:00Z" },
    ]


    const handleToggle = () => {
        setSurveyLocked(prev => !prev)
    }

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
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center">Liên minh HTX - Quản lý khảo sát</h1>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="text-lg">
                        Số HTX đã tham gia khảo sát:{" "}
                        <span className="font-semibold text-primary">{participatedHTX}</span> / {totalHTX}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                        <Label className="text-base">Trạng thái khảo sát</Label>
                        <div className="flex items-center gap-2">
                            <Switch checked={surveyLocked} onCheckedChange={handleToggle} />
                            <span className={surveyLocked ? "text-red-600" : "text-green-600"}>
                                {surveyLocked ? "Đã khoá" : "Đang mở"}
                            </span>
                        </div>
                    </div>

                    <Button onClick={handleToggle} variant={surveyLocked ? "default" : "destructive"}>
                        {surveyLocked ? "Mở lại khảo sát" : "Khoá khảo sát"}
                    </Button>
                    <h2 className="text-lg font-semibold">Tỷ lệ HTX đã tham gia khảo sát</h2>
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
                                <Cell fill="#34d399" /> {/* xanh lá */}
                                <Cell fill="#f87171" /> {/* đỏ nhạt */}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <h2 className="text-lg font-semibold pt-6 border-t">Danh sách HTX đã tham gia</h2>
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
