"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = () => {
        if (username && password) {
            router.push("/survey")
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>
                    <div>
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handleLogin}>
                        Đăng nhập
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
