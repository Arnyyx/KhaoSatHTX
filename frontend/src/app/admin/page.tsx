"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, BarChart2 } from "lucide-react";
import Link from "next/link";

// Dữ liệu giả
const reportData = {
    labels: ["Hài lòng", "Bình thường", "Không hài lòng"],
    values: [50, 30, 20],
};

const users = [
    { id: 1, username: "admin1", email: "admin1@example.com", role: "Admin" },
    { id: 2, username: "user1", email: "user1@example.com", role: "User" },
];

const surveys = [
    {
        id: 1,
        title: "Khảo sát chất lượng HTX 2025",
        description: "Đánh giá mức độ hài lòng của các thành viên HTX.",
        startTime: "2025-04-01T09:00:00",
        endTime: "2025-04-30T23:59:59",
        status: true,
    },
    {
        id: 2,
        title: "Khảo sát nhu cầu thị trường",
        description: "Tìm hiểu nhu cầu sản phẩm nông nghiệp.",
        startTime: "2025-05-01T00:00:00",
        endTime: "2025-05-15T23:59:59",
        status: false,
    },
];

const questions = [
    {
        id: 1,
        surveyId: 1,
        content: "Bạn có hài lòng với chất lượng dịch vụ?",
        type: "Multiple Choice",
    },
    {
        id: 2,
        surveyId: 1,
        content: "Góp ý cải thiện dịch vụ HTX?",
        type: "Text",
    },
];

export default function AdminPage() {
    // State cho dialog thêm người dùng
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [userFormData, setUserFormData] = useState({
        username: "",
        email: "",
        role: "User",
    });

    // State cho dialog thêm khảo sát
    const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
    const [surveyFormData, setSurveyFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        status: true,
    });

    // State cho dialog thêm câu hỏi
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [questionFormData, setQuestionFormData] = useState({
        surveyId: "",
        content: "",
        type: "Multiple Choice",
    });

    // Xử lý form người dùng
    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("User submitted", userFormData);
        setUserDialogOpen(false);
        setUserFormData({ username: "", email: "", role: "User" });
    };

    // Xử lý form khảo sát
    const handleSurveyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
        setSurveyFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSurveySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Survey submitted", surveyFormData);
        setSurveyDialogOpen(false);
        setSurveyFormData({ title: "", description: "", startTime: "", endTime: "", status: true });
    };

    // Xử lý form câu hỏi
    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setQuestionFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Question submitted", questionFormData);
        setQuestionDialogOpen(false);
        setQuestionFormData({ surveyId: "", content: "", type: "Multiple Choice" });
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Card className="mx-auto w-full">
                <CardContent className="p-6">
                    <h1 className="text-2xl font-semibold mb-6">Quản trị hệ thống</h1>
                    <Tabs defaultValue="reports" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="reports">Báo cáo</TabsTrigger>
                            <TabsTrigger value="users">Người dùng</TabsTrigger>
                            <TabsTrigger value="surveys">Khảo sát</TabsTrigger>
                            <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
                            <TabsTrigger value="address">Đơn Vị Hành Chính</TabsTrigger>
                        </TabsList>

                        {/* Tab Báo cáo */}
                        <TabsContent value="reports">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-4">Báo cáo khảo sát</h2>
                                    <div className="flex items-center gap-4 mb-4">
                                        <BarChart2 className="w-6 h-6" />
                                        <span>Kết quả khảo sát (dữ liệu giả)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {reportData.labels.map((label, index) => (
                                            <div key={index} className="flex flex-col items-center">
                                                <span>{label}</span>
                                                <div className="w-full bg-gray-200 rounded-full h-4">
                                                    <div
                                                        className="bg-blue-600 h-4 rounded-full"
                                                        style={{ width: `${reportData.values[index]}%` }}
                                                    />
                                                </div>
                                                <span>{reportData.values[index]}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Người dùng */}
                        <TabsContent value="users">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
                                        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button>Thêm người dùng</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle>Thêm người dùng mới</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleUserSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="username">Tên người dùng</Label>
                                                        <Input
                                                            id="username"
                                                            name="username"
                                                            value={userFormData.username}
                                                            onChange={handleUserChange}
                                                            required
                                                            placeholder="Nhập tên người dùng"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={userFormData.email}
                                                            onChange={handleUserChange}
                                                            required
                                                            placeholder="Nhập email"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="role">Vai trò</Label>
                                                        <Select
                                                            name="role"
                                                            value={userFormData.role}
                                                            onValueChange={(value) =>
                                                                setUserFormData(prev => ({ ...prev, role: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn vai trò" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Admin">Admin</SelectItem>
                                                                <SelectItem value="User">User</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setUserDialogOpen(false)}
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button type="submit">Thêm người dùng</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                                    <TableHead className="w-[50px]">ID</TableHead>
                                                    <TableHead className="w-[200px]">Tên người dùng</TableHead>
                                                    <TableHead className="w-[200px]">Email</TableHead>
                                                    <TableHead className="w-[100px]">Vai trò</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm">
                                                                    <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => console.log(`Xóa người dùng ID: ${user.id}`)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{user.id}</TableCell>
                                                        <TableCell>{user.username}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>{user.role}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Khảo sát */}
                        <TabsContent value="surveys">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Quản lý khảo sát</h2>
                                        <Dialog open={surveyDialogOpen} onOpenChange={setSurveyDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button>Thêm khảo sát</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[600px]">
                                                <DialogHeader>
                                                    <DialogTitle>Thêm khảo sát mới</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleSurveySubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="title">Tiêu đề</Label>
                                                        <Input
                                                            id="title"
                                                            name="title"
                                                            value={surveyFormData.title}
                                                            onChange={handleSurveyChange}
                                                            required
                                                            placeholder="Nhập tiêu đề khảo sát"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="description">Mô tả</Label>
                                                        <Textarea
                                                            id="description"
                                                            name="description"
                                                            value={surveyFormData.description}
                                                            onChange={handleSurveyChange}
                                                            required
                                                            placeholder="Nhập mô tả khảo sát"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="startTime">Thời gian bắt đầu</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="startTime"
                                                            name="startTime"
                                                            value={surveyFormData.startTime}
                                                            onChange={handleSurveyChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="endTime">Thời gian kết thúc</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="endTime"
                                                            name="endTime"
                                                            value={surveyFormData.endTime}
                                                            onChange={handleSurveyChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="status"
                                                            name="status"
                                                            checked={surveyFormData.status}
                                                            onCheckedChange={(checked: boolean) => {
                                                                setSurveyFormData(prev => ({ ...prev, status: checked }));
                                                            }}
                                                            aria-label="Kích hoạt khảo sát"
                                                        />
                                                        <Label htmlFor="status">Kích hoạt khảo sát</Label>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setSurveyDialogOpen(false)}
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button type="submit">Thêm khảo sát</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                                    <TableHead className="w-[50px]">ID</TableHead>
                                                    <TableHead className="w-[200px]">Tiêu đề</TableHead>
                                                    <TableHead className="w-[400px]">Mô tả</TableHead>
                                                    <TableHead className="w-[150px]">Thời gian bắt đầu</TableHead>
                                                    <TableHead className="w-[150px]">Thời gian kết thúc</TableHead>
                                                    <TableHead className="w-[100px]">Trạng thái</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {surveys.map((survey) => (
                                                    <TableRow key={survey.id}>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={`/surveys/edit/${survey.id}`}>
                                                                        <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => console.log(`Xóa khảo sát ID: ${survey.id}`)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{survey.id}</TableCell>
                                                        <TableCell>{survey.title}</TableCell>
                                                        <TableCell>{survey.description}</TableCell>
                                                        <TableCell>
                                                            {new Date(survey.startTime).toLocaleString("vi-VN")}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(survey.endTime).toLocaleString("vi-VN")}
                                                        </TableCell>
                                                        <TableCell>
                                                            {survey.status ? (
                                                                <span className="text-green-600">Kích hoạt</span>
                                                            ) : (
                                                                <span className="text-red-600">Tắt</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Câu hỏi */}
                        <TabsContent value="questions">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Quản lý câu hỏi</h2>
                                        <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button>Thêm câu hỏi</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle>Thêm câu hỏi mới</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="surveyId">Khảo sát</Label>
                                                        <Select
                                                            name="surveyId"
                                                            value={questionFormData.surveyId}
                                                            onValueChange={(value) =>
                                                                setQuestionFormData(prev => ({ ...prev, surveyId: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn khảo sát" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {surveys.map((survey) => (
                                                                    <SelectItem key={survey.id} value={survey.id.toString()}>
                                                                        {survey.title}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="content">Nội dung câu hỏi</Label>
                                                        <Textarea
                                                            id="content"
                                                            name="content"
                                                            value={questionFormData.content}
                                                            onChange={handleQuestionChange}
                                                            required
                                                            placeholder="Nhập nội dung câu hỏi"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="type">Loại câu hỏi</Label>
                                                        <Select
                                                            name="type"
                                                            value={questionFormData.type}
                                                            onValueChange={(value) =>
                                                                setQuestionFormData(prev => ({ ...prev, type: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn loại câu hỏi" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Multiple Choice">Trắc nghiệm</SelectItem>
                                                                <SelectItem value="Text">Văn bản</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setQuestionDialogOpen(false)}
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button type="submit">Thêm câu hỏi</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                                    <TableHead className="w-[50px]">ID</TableHead>
                                                    <TableHead className="w-[200px]">Khảo sát</TableHead>
                                                    <TableHead className="w-[300px]">Nội dung</TableHead>
                                                    <TableHead className="w-[150px]">Loại</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {questions.map((question) => (
                                                    <TableRow key={question.id}>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm">
                                                                    <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => console.log(`Xóa câu hỏi ID: ${question.id}`)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{question.id}</TableCell>
                                                        <TableCell>
                                                            {surveys.find((s) => s.id === question.surveyId)?.title || "N/A"}
                                                        </TableCell>
                                                        <TableCell>{question.content}</TableCell>
                                                        <TableCell>{question.type}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="address">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-4">Quản lý Đơn Vị Hành Chính</h2>
                                    <Link href="/provinces" className="mr-4">
                                        <Button variant="outline">Tỉnh/Thành phố</Button>
                                    </Link>
                                    <Link href="/districts" className="mr-4">
                                        <Button variant="outline">Quận/Huyện</Button>
                                    </Link>
                                    <Link href="/wards" className="mr-4">
                                        <Button variant="outline">Phường/Xã</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );
}