"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

type Info = {
  Id: number
  Name: string
  Region: string
}

export default function InfoTablePage() {
  const [infoList, setInfoList] = useState<Info[]>([])

    useEffect(() => {
        // Gọi API từ backend Next.js
        async function fetchInfo() {
            try {
                const response = await fetch("./api/provinces")
                const data = await response.json()
                console.log(data)
                setInfoList(data)
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchInfo()
    }, [])

    if (infoList.length === 0) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p>Đang tải dữ liệu...</p>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-3xl">
                <CardContent className="p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-center">Danh sách thông tin</h1>
                    <table className="w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 border border-gray-300">Tên</th>
                                <th className="p-2 border border-gray-300">Vùng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {infoList.map((item) => (
                                <tr key={item.Id} className="border-b border-gray-300">
                                    <td className="p-2">{item.Name}</td>
                                    <td className="p-2">{item.Region}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </main>
    )
}