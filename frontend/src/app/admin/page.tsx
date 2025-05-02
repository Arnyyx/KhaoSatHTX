"use client";

import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, BarChart2 } from "lucide-react";
import Link from "next/link";
import { API } from "@/lib/api";
import { toast } from "sonner";

const reportData = {
    labels: ["Hài lòng", "Bình thường", "Không hài lòng"],
    values: [50, 30, 20],
};

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

interface User {
    Id: number;
    Username: string;
    Email: string;
    Role: string;
    Password: string;
    Type: string;
    OrganizationName: string;
    Name: string;
    ProvinceId: string;
    NumberCount: string;
    EstablishedDate: string;
    Member: string;
    Status: boolean;
    Address: string;
    Position: string;
}

interface Survey {
    Id: number;
    Title: string;
    Description: string;
    StartTime: string;
    EndTime: string;
    Status: boolean;
}

export default function AdminPage() {
    // State cho người dùng
    const [users, setUsers] = useState<User[]>([]);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [userFormData, setUserFormData] = useState({
        Username: "",
        Email: "",
        Role: "HTX",
        Password: "",
        Type: "PNN",
        OrganizationName: "",
        Name: "",
        ProvinceId: "",
        NumberCount: "",
        EstablishedDate: "",
        Member: "",
        Status: true,
        Address: "",
        Position: "",
    });

    const provinces = [
        { id: 1, name: "Hà Nội" },
        { id: 2, name: "TP. Hồ Chí Minh" },
        // Thêm các tỉnh/thành phố khác
    ];

    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userLoading, setUserLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);

    // State cho khảo sát
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
    const [surveyFormData, setSurveyFormData] = useState({
        Title: "",
        Description: "",
        StartTime: "",
        EndTime: "",
        Status: true,
    });
    const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
    const [surveyLoading, setSurveyLoading] = useState(false);
    const [surveyError, setSurveyError] = useState<string | null>(null);

    // State cho câu hỏi (giữ nguyên dữ liệu giả)
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [questionFormData, setQuestionFormData] = useState({
        surveyId: "",
        content: "",
        type: "Multiple Choice",
    });

    useEffect(() => {
        const fetchUsers = async () => {
            setUserLoading(true);
            try {
                const res = await fetch(`${API.users}`);
                if (!res.ok) throw new Error("Không thể lấy danh sách người dùng");
                const response = await res.json();
                console.log("API response:", response);
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (error: any) {
                setUserError(error.message);
                toast.error("Lỗi khi lấy danh sách người dùng", {
                    description: error.message,
                });
            } finally {
                setUserLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Lấy danh sách khảo sát
    useEffect(() => {
        const fetchSurveys = async () => {
            setSurveyLoading(true);
            try {
                const res = await fetch(API.surveys);
                if (!res.ok) throw new Error("Không thể lấy danh sách khảo sát");
                const data = await res.json();
                setSurveys(data);
            } catch (error: any) {
                setSurveyError(error.message);
                toast.error("Lỗi khi lấy danh sách khảo sát", {
                    description: error.message,
                });
            } finally {
                setSurveyLoading(false);
            }
        };
        fetchSurveys();
    }, []);

    // Xử lý form người dùng
    const handleUserChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: any }
    ) => {
        const { name, value, type } = "target" in e ? e.target : e;
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
        setUserFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingUserId ? "PUT" : "POST";
            const url = editingUserId ? `${API.users}/${editingUserId}` : API.users;
            const payload = {
                Username: userFormData.Username,
                Email: userFormData.Email || null,
                Role: userFormData.Role,
                Password: userFormData.Password,
                Type: userFormData.Type,
                OrganizationName:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? userFormData.OrganizationName
                        : null,
                Name:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? userFormData.Name
                        : null,
                ProvinceId:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? parseInt(userFormData.ProvinceId) || null
                        : null,
                NumberCount:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? parseInt(userFormData.NumberCount) || null
                        : null,
                EstablishedDate:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? userFormData.EstablishedDate
                        : null,
                Member:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? userFormData.Member
                        : null,
                Status:
                    userFormData.Role === "HTX" || userFormData.Role === "QTD"
                        ? userFormData.Status
                        : true,
                Address: userFormData.Address || null,
                Position: userFormData.Position || null,
            };
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok)
                throw new Error(
                    editingUserId ? "Không thể cập nhật người dùng" : "Không thể thêm người dùng"
                );
            const response = await res.json();
            console.log("API response:", response);
            const newUser = response.data;
            if (!newUser) throw new Error("Dữ liệu người dùng không hợp lệ");
            if (editingUserId) {
                setUsers(users.map((u) => (u.Id === editingUserId ? newUser : u)));
                toast.success("Cập nhật người dùng thành công");
            } else {
                setUsers([...users, newUser]);
                toast.success("Thêm người dùng thành công");
            }
            setUserDialogOpen(false);
            setUserFormData({
                Username: "",
                Email: "",
                Role: "HTX",
                Password: "",
                Type: "PNN",
                OrganizationName: "",
                Name: "",
                ProvinceId: "",
                NumberCount: "",
                EstablishedDate: "",
                Member: "",
                Status: true,
                Address: "",
                Position: "",
            });
            setEditingUserId(null);
        } catch (error: any) {
            toast.error(
                editingUserId ? "Lỗi khi cập nhật người dùng" : "Lỗi khi thêm người dùng",
                {
                    description: error.message,
                }
            );
        }
    };


    const handleDeleteUser = async (id: number) => {
        try {
            const res = await fetch(`${API.users}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Không thể xóa người dùng");
            setUsers(users.filter((u) => u.Id !== id));
            toast.success("Xóa người dùng thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa người dùng", {
                description: error.message,
            });
        }
    };

    // Xử lý form khảo sát
    const handleSurveyChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: any }
    ) => {
        const { name, value, type } = "target" in e ? e.target : e;
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
        setSurveyFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSurveySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingSurveyId ? "PUT" : "POST";
            const url = editingSurveyId
                ? `${API.surveys}/${editingSurveyId}`
                : API.surveys;
            const payload = {
                title: surveyFormData.Title,
                description: surveyFormData.Description,
                startTime: new Date(surveyFormData.StartTime).toISOString(),
                endTime: new Date(surveyFormData.EndTime).toISOString(),
                status: surveyFormData.Status,
            };
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(editingSurveyId ? "Không thể cập nhật khảo sát" : "Không thể thêm khảo sát");
            const data = await res.json();
            if (editingSurveyId) {
                setSurveys(surveys.map((s) => (s.Id === editingSurveyId ? data : s)));
                toast.success("Cập nhật khảo sát thành công");
            } else {
                setSurveys([...surveys, data]);
                toast.success("Thêm khảo sát thành công");
            }
            setSurveyDialogOpen(false);
            setSurveyFormData({ Title: "", Description: "", StartTime: "", EndTime: "", Status: true });
            setEditingSurveyId(null);
        } catch (error: any) {
            toast.error(editingSurveyId ? "Lỗi khi cập nhật khảo sát" : "Lỗi khi thêm khảo sát", {
                description: error.message,
            });
        }
    };

    const handleDeleteSurvey = async (id: number) => {
        try {
            const res = await fetch(`${API.surveys}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Không thể xóa khảo sát");
            setSurveys(surveys.filter((s) => s.Id !== id));
            toast.success("Xóa khảo sát thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa khảo sát", {
                description: error.message,
            });
        }
    };

    // Xử lý form câu hỏi (giữ nguyên vì chưa có API)
    const handleQuestionChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
    ) => {
        const { name, value } = "target" in e ? e.target : e;
        setQuestionFormData((prev) => ({ ...prev, [name]: value }));
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
                                                <Button onClick={() => setEditingUserId(null)}>Thêm người dùng</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[600px]">
                                                <DialogHeader>
                                                    <DialogTitle>{editingUserId ? "Sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleUserSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="Username">Tên người dùng</Label>
                                                        <Input
                                                            id="Username"
                                                            name="Username"
                                                            value={userFormData.Username}
                                                            onChange={handleUserChange}
                                                            required
                                                            placeholder="Nhập tên người dùng"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="Email">Email</Label>
                                                        <Input
                                                            id="Email"
                                                            name="Email"
                                                            type="email"
                                                            value={userFormData.Email}
                                                            onChange={handleUserChange}
                                                            placeholder="Nhập email (tùy chọn)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="Password">Mật khẩu</Label>
                                                        <Input
                                                            id="Password"
                                                            name="Password"
                                                            type="password"
                                                            value={userFormData.Password}
                                                            onChange={handleUserChange}
                                                            required={!editingUserId}
                                                            placeholder="Nhập mật khẩu"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="Role">Vai trò</Label>
                                                        <Select
                                                            name="Role"
                                                            value={userFormData.Role}
                                                            onValueChange={(value) =>
                                                                setUserFormData((prev) => ({ ...prev, Role: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn vai trò" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                                <SelectItem value="HTX">HTX</SelectItem>
                                                                <SelectItem value="QTD">QTD</SelectItem>
                                                                <SelectItem value="LMHTX">LMHTX</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {(userFormData.Role === "HTX" || userFormData.Role === "QTD") && (
                                                        <>
                                                            <div>
                                                                <Label htmlFor="OrganizationName">Tên tổ chức</Label>
                                                                <Input
                                                                    id="OrganizationName"
                                                                    name="OrganizationName"
                                                                    value={userFormData.OrganizationName}
                                                                    onChange={handleUserChange}
                                                                    required
                                                                    placeholder="Nhập tên tổ chức"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="Name">Tên đại diện</Label>
                                                                <Input
                                                                    id="Name"
                                                                    name="Name"
                                                                    value={userFormData.Name}
                                                                    onChange={handleUserChange}
                                                                    required
                                                                    placeholder="Nhập tên đại diện"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="Type">Loại</Label>
                                                                <Select
                                                                    name="Type"
                                                                    value={userFormData.Type}
                                                                    onValueChange={(value) =>
                                                                        setUserFormData((prev) => ({ ...prev, Type: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn loại" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="PNN">PNN</SelectItem>
                                                                        <SelectItem value="NN">NN</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="ProvinceId">Tỉnh/Thành phố</Label>
                                                                <Select
                                                                    name="ProvinceId"
                                                                    value={userFormData.ProvinceId}
                                                                    onValueChange={(value) =>
                                                                        setUserFormData((prev) => ({ ...prev, ProvinceId: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {provinces.map((province) => (
                                                                            <SelectItem key={province.id} value={province.id.toString()}>
                                                                                {province.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="NumberCount">Số lượng thành viên</Label>
                                                                <Input
                                                                    id="NumberCount"
                                                                    name="NumberCount"
                                                                    type="number"
                                                                    value={userFormData.NumberCount}
                                                                    onChange={handleUserChange}
                                                                    required
                                                                    placeholder="Nhập số lượng thành viên"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="EstablishedDate">Ngày thành lập</Label>
                                                                <Input
                                                                    id="EstablishedDate"
                                                                    name="EstablishedDate"
                                                                    type="date"
                                                                    value={userFormData.EstablishedDate}
                                                                    onChange={handleUserChange}
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="Member">Loại thành viên</Label>
                                                                <Input
                                                                    id="Member"
                                                                    name="Member"
                                                                    value={userFormData.Member}
                                                                    onChange={handleUserChange}
                                                                    required
                                                                    placeholder="Nhập loại thành viên"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id="Status"
                                                                    name="Status"
                                                                    checked={userFormData.Status}
                                                                    onCheckedChange={(checked: boolean) =>
                                                                        setUserFormData((prev) => ({ ...prev, Status: checked }))
                                                                    }
                                                                    aria-label="Trạng thái hoạt động"
                                                                />
                                                                <Label htmlFor="Status">Trạng thái hoạt động</Label>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div>
                                                        <Label htmlFor="Address">Địa chỉ cụ thể</Label>
                                                        <Input
                                                            id="Address"
                                                            name="Address"
                                                            value={userFormData.Address}
                                                            onChange={handleUserChange}
                                                            placeholder="Nhập địa chỉ (tùy chọn)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="Position">Vị trí/Chức vụ</Label>
                                                        <Input
                                                            id="Position"
                                                            name="Position"
                                                            value={userFormData.Position}
                                                            onChange={handleUserChange}
                                                            placeholder="Nhập vị trí/chức vụ (tùy chọn)"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setUserDialogOpen(false)}
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button type="submit">{editingUserId ? "Cập nhật" : "Thêm người dùng"}</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    {userLoading && <p>Đang tải dữ liệu...</p>}
                                    {userError && <p className="text-red-600">{userError}</p>}
                                    {!userLoading && !userError && (
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
                                                    {Array.isArray(users) && users.length > 0 ? (
                                                        users.map((user) => (
                                                            <TableRow key={user.Id}>
                                                                <TableCell>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setEditingUserId(user.Id);
                                                                                setUserFormData({
                                                                                    Username: user.Username,
                                                                                    Email: user.Email || "",
                                                                                    Role: user.Role,
                                                                                    Password: "",
                                                                                    Type: user.Type || "PNN",
                                                                                    OrganizationName: user.OrganizationName || "",
                                                                                    Name: user.Name || "",
                                                                                    ProvinceId: user.ProvinceId?.toString() || "",
                                                                                    NumberCount: user.NumberCount?.toString() || "",
                                                                                    EstablishedDate: user.EstablishedDate
                                                                                        ? new Date(user.EstablishedDate).toISOString().slice(0, 10)
                                                                                        : "",
                                                                                    Member: user.Member || "",
                                                                                    Status: user.Status ?? true,
                                                                                    Address: user.Address || "",
                                                                                    Position: user.Position || "",
                                                                                });
                                                                                setUserDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                                        </Button>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteUser(user.Id)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>{user.Id}</TableCell>
                                                                <TableCell>{user.Username}</TableCell>
                                                                <TableCell>{user.Email}</TableCell>
                                                                <TableCell>{user.Role}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center">
                                                                Không có dữ liệu người dùng
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
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
                                                <Button onClick={() => setEditingSurveyId(null)}>Thêm khảo sát</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[600px]">
                                                <DialogHeader>
                                                    <DialogTitle>{editingSurveyId ? "Sửa khảo sát" : "Thêm khảo sát mới"}</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleSurveySubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="Title">Tiêu đề</Label>
                                                        <Input
                                                            id="Title"
                                                            name="Title"
                                                            value={surveyFormData.Title}
                                                            onChange={handleSurveyChange}
                                                            required
                                                            placeholder="Nhập tiêu đề khảo sát"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="Description">Mô tả</Label>
                                                        <Textarea
                                                            id="Description"
                                                            name="Description"
                                                            value={surveyFormData.Description}
                                                            onChange={handleSurveyChange}
                                                            required
                                                            placeholder="Nhập mô tả khảo sát"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="StartTime">Thời gian bắt đầu</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="StartTime"
                                                            name="StartTime"
                                                            value={surveyFormData.StartTime}
                                                            onChange={handleSurveyChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="EndTime">Thời gian kết thúc</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="EndTime"
                                                            name="EndTime"
                                                            value={surveyFormData.EndTime}
                                                            onChange={handleSurveyChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="Status"
                                                            name="Status"
                                                            checked={surveyFormData.Status}
                                                            onCheckedChange={(checked: boolean) =>
                                                                setSurveyFormData((prev) => ({ ...prev, Status: checked }))
                                                            }
                                                            aria-label="Kích hoạt khảo sát"
                                                        />
                                                        <Label htmlFor="Status">Kích hoạt khảo sát</Label>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setSurveyDialogOpen(false)}
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button type="submit">{editingSurveyId ? "Cập nhật" : "Thêm khảo sát"}</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    {surveyLoading && <p>Đang tải dữ liệu...</p>}
                                    {surveyError && <p className="text-red-600">{surveyError}</p>}
                                    {!surveyLoading && !surveyError && (
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
                                                        <TableRow key={survey.Id}>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setEditingSurveyId(survey.Id);
                                                                            setSurveyFormData({
                                                                                Title: survey.Title,
                                                                                Description: survey.Description,
                                                                                StartTime: new Date(survey.StartTime).toISOString().slice(0, 16),
                                                                                EndTime: new Date(survey.EndTime).toISOString().slice(0, 16),
                                                                                Status: survey.Status,
                                                                            });
                                                                            setSurveyDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteSurvey(survey.Id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{survey.Id}</TableCell>
                                                            <TableCell>{survey.Title}</TableCell>
                                                            <TableCell>{survey.Description}</TableCell>
                                                            <TableCell>
                                                                {new Date(survey.StartTime).toLocaleString("vi-VN")}
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(survey.EndTime).toLocaleString("vi-VN")}
                                                            </TableCell>
                                                            <TableCell>
                                                                {survey.Status ? (
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
                                    )}
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
                                                                setQuestionFormData((prev) => ({ ...prev, surveyId: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn khảo sát" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {surveys.map((survey) => (
                                                                    <SelectItem key={survey.Id} value={survey.Id.toString()}>
                                                                        {survey.Title}
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
                                                                setQuestionFormData((prev) => ({ ...prev, type: value }))
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
                                                            {surveys.find((s) => s.Id === question.surveyId)?.Title || "N/A"}
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

                        {/* Tab Đơn Vị Hành Chính */}
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