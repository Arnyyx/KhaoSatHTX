"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { API } from "@/lib/api"
import { toast } from "sonner"
import { ArrowUp, ArrowDown } from "lucide-react"

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
    const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [form, setForm] = useState<Partial<Survey>>({})
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [surveyToDelete, setSurveyToDelete] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">("all")
    const [sortField, setSortField] = useState<keyof Survey | null>(null)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

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
            setFilteredSurveys(data)
        } catch (error) {
            toast.error("Không thể tải danh sách khảo sát", {
                description: "Vui lòng thử lại sau",
            })
        }
    }

    // Xử lý tìm kiếm, lọc, và sắp xếp
    useEffect(() => {
        let result = [...surveys]

        // Tìm kiếm theo tiêu đề hoặc mô tả
        if (searchTerm) {
            result = result.filter(
                (s) =>
                    s.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.Description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((s) => s.Status === (statusFilter === "active"))
        }

        // Sắp xếp
        if (sortField) {
            result.sort((a, b) => {
                let valueA = a[sortField]
                let valueB = b[sortField]

                if (sortField === "StartTime" || sortField === "EndTime") {
                    valueA = new Date(valueA).getTime()
                    valueB = new Date(valueB).getTime()
                } else if (sortField === "Status") {
                    valueA = valueA ? 1 : 0
                    valueB = valueB ? 1 : 0
                } else {
                    valueA = valueA.toString().toLowerCase()
                    valueB = valueB.toString().toLowerCase()
                }

                if (valueA < valueB) return sortOrder === "asc" ? -1 : 1
                if (valueA > valueB) return sortOrder === "asc" ? 1 : -1
                return 0
            })
        }

        setFilteredSurveys(result)
    }, [searchTerm, statusFilter, sortField, sortOrder, surveys])

    const handleSort = (field: keyof Survey) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("asc")
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
            status: form.Status ?? true,
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
                                setForm({ Status: true })
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

            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                    <Label className="text-sm font-medium">Tìm kiếm</Label>
                    <Input
                        placeholder="Tìm theo tiêu đề hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div className="w-40">
                    <Label className="text-sm font-medium">Lọc trạng thái</Label>
                    <select
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "ended")}
                    >
                        <option value="all">Tất cả</option>
                        <option value="active">Hoạt động</option>
                        <option value="ended">Đã kết thúc</option>
                    </select>
                </div>
            </div>

            {/* Bảng khảo sát */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-medium">
                                <Button variant="ghost" onClick={() => handleSort("Title")} className="hover:bg-muted">
                                    Tiêu đề
                                    {sortField === "Title" && (sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                </Button>
                            </TableHead>
                            <TableHead className="font-medium">
                                <Button variant="ghost" onClick={() => handleSort("Description")} className="hover:bg-muted">
                                    Mô tả
                                    {sortField === "Description" && (sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                </Button>
                            </TableHead>
                            <TableHead className="font-medium">
                                <Button variant="ghost" onClick={() => handleSort("StartTime")} className="hover:bg-muted">
                                    Thời gian bắt đầu
                                    {sortField === "StartTime" && (sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                </Button>
                            </TableHead>
                            <TableHead className="font-medium">
                                <Button variant="ghost" onClick={() => handleSort("EndTime")} className="hover:bg-muted">
                                    Thời gian kết thúc
                                    {sortField === "EndTime" && (sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                </Button>
                            </TableHead>
                            <TableHead className="font-medium">
                                <Button variant="ghost" onClick={() => handleSort("Status")} className="hover:bg-muted">
                                    Trạng thái
                                    {sortField === "Status" && (sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                </Button>
                            </TableHead>
                            <TableHead className="font-medium text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSurveys.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Không tìm thấy khảo sát nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSurveys.map((s) => (
                                <TableRow key={s.Id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{s.Title}</TableCell>
                                    <TableCell>{s.Description}</TableCell>
                                    <TableCell>{new Date(s.StartTime).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(s.EndTime).toLocaleDateString()}</TableCell>
                                    <TableCell>{s.Status ? "🟢 Hoạt động" : "🔴 Kết thúc"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setForm({
                                                        ...s,
                                                        StartTime: new Date(s.StartTime).toISOString(),
                                                        EndTime: new Date(s.EndTime).toISOString(),
                                                        Status: s.Status ?? true,
                                                    })
                                                    setIsEditing(true)
                                                    setIsOpen(true)
                                                }}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setSurveyToDelete(s.Id)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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