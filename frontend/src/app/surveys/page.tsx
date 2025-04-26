"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API } from "@/lib/api"
import { toast } from "sonner"

interface Survey {
    Id: number
    Title: string
    Description: string
    StartTime: string
    EndTime: string
    Status: boolean
}

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [form, setForm] = useState<Partial<Survey>>({})
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [surveyToDelete, setSurveyToDelete] = useState<number | null>(null)

    // Fetch surveys
    useEffect(() => {
        fetchSurveys()
    }, [])

    const fetchSurveys = async () => {
        try {
            const res = await fetch(API.surveys)
            if (!res.ok) throw new Error("Failed to fetch surveys")
            const data = await res.json()
            setSurveys(data)
        } catch (error) {
            toast.error("Không thể tải danh sách khảo sát", {
                description: "Vui lòng thử lại sau",
            })
        }
    }

    const handleSubmit = async () => {
        if (!form.Title || !form.Description || !form.StartTime || !form.EndTime) {
            toast.error("Vui lòng điền đầy đủ thông tin khảo sát!", {
                description: "Kiểm tra lại các trường bắt buộc",
            })
            return
        }

        const payload = {
            title: form.Title,
            description: form.Description,
            startTime: new Date(form.StartTime).toISOString(),
            endTime: new Date(form.EndTime).toISOString(),
            status: form.Status ?? true, // Đặt mặc định là true nếu Status là undefined
        }

        try {
            const method = isEditing ? "PUT" : "POST"
            const url = isEditing ? `${API.surveys}/${form.Id}` : API.surveys
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save survey")

            toast.success(isEditing ? "Cập nhật khảo sát thành công" : "Tạo khảo sát thành công")
            setIsOpen(false)
            setForm({})
            fetchSurveys()
        } catch (error) {
            toast.error("Không thể lưu khảo sát", {
                description: "Đã có lỗi xảy ra, vui lòng thử lại",
            })
        }
    }

    const handleDelete = async () => {
        if (!surveyToDelete) return

        try {
            const res = await fetch(`${API.surveys}/${surveyToDelete}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete survey")

            setSurveys(surveys.filter((s) => s.Id !== surveyToDelete))
            toast.success("Xóa khảo sát thành công")
            setIsDeleteDialogOpen(false)
            setSurveyToDelete(null)
        } catch (error) {
            toast.error("Không thể xóa khảo sát", {
                description: "Đã có lỗi xảy ra, vui lòng thử lại",
            })
        }
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý Khảo sát</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setForm({ Status: true }) // Đặt mặc định Status là true (Hoạt động)
                                setIsEditing(false)
                                setIsOpen(true)
                            }}
                        >
                            Tạo khảo sát
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <h2 className="text-lg font-semibold mb-2">{isEditing ? "Chỉnh sửa" : "Tạo mới"} khảo sát</h2>
                        <div className="space-y-3">
                            <div>
                                <Label>Tiêu đề</Label>
                                <Input
                                    value={form.Title || ""}
                                    onChange={(e) => setForm({ ...form, Title: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Mô tả</Label>
                                <Textarea
                                    value={form.Description || ""}
                                    onChange={(e) => setForm({ ...form, Description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Thời gian bắt đầu</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.StartTime ? new Date(form.StartTime).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setForm({ ...form, StartTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Thời gian kết thúc</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.EndTime ? new Date(form.EndTime).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setForm({ ...form, EndTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Trạng thái</Label>
                                <select
                                    className="border rounded px-2 py-1 w-full"
                                    value={form.Status === undefined ? "1" : form.Status ? "1" : "0"}
                                    onChange={(e) => setForm({ ...form, Status: e.target.value === "1" })}
                                >
                                    <option value="1">Hoạt động</option>
                                    <option value="0">Đã kết thúc</option>
                                </select>
                            </div>
                            <Button onClick={handleSubmit}>{isEditing ? "Lưu thay đổi" : "Tạo khảo sát"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {surveys.map((s) => (
                    <Card key={s.Id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold text-lg">{s.Title}</h2>
                                <p className="text-sm text-muted-foreground">{s.Description}</p>
                                <p className="text-sm mt-1">
                                    ⏱ {new Date(s.StartTime).toLocaleDateString()} → {new Date(s.EndTime).toLocaleDateString()}
                                </p>
                                <p className="text-sm">{s.Status ? "🟢 Hoạt động" : "🔴 Kết thúc"}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setForm({
                                            ...s,
                                            StartTime: new Date(s.StartTime).toISOString(),
                                            EndTime: new Date(s.EndTime).toISOString(),
                                            Status: s.Status ?? true, // Đặt mặc định Status là true nếu không có
                                        })
                                        setIsEditing(true)
                                        setIsOpen(true)
                                    }}
                                >
                                    Sửa
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setSurveyToDelete(s.Id)
                                        setIsDeleteDialogOpen(true)
                                    }}
                                >
                                    Xóa
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog xác nhận xóa */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa khảo sát</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa khảo sát này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setSurveyToDelete(null)
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}