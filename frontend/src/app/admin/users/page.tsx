"use client";

import { useState, useEffect } from "react";
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
import { Pencil, Trash2 } from "lucide-react";
import { API } from "@/lib/api";
import { toast } from "sonner";

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

export default function UsersPage() {
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
    ];

    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userLoading, setUserLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setUserLoading(true);
            try {
                const res = await fetch(`${API.users}`);
                if (!res.ok) throw new Error("Không thể lấy danh sách người dùng");
                const response = await res.json();
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
            toast.error("Lỗi khi lưu người dùng", {
                description: error.message,
            });
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUserId(user.Id);
        setUserFormData({
            Username: user.Username,
            Email: user.Email || "",
            Role: user.Role,
            Password: "",
            Type: user.Type,
            OrganizationName: user.OrganizationName || "",
            Name: user.Name || "",
            ProvinceId: user.ProvinceId || "",
            NumberCount: user.NumberCount || "",
            EstablishedDate: user.EstablishedDate || "",
            Member: user.Member || "",
            Status: user.Status,
            Address: user.Address || "",
            Position: user.Position || "",
        });
        setUserDialogOpen(true);
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Thêm người dùng</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingUserId ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="Username">Tên đăng nhập</Label>
                                    <Input
                                        id="Username"
                                        name="Username"
                                        value={userFormData.Username}
                                        onChange={handleUserChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="Email">Email</Label>
                                    <Input
                                        id="Email"
                                        name="Email"
                                        type="email"
                                        value={userFormData.Email}
                                        onChange={handleUserChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="Role">Vai trò</Label>
                                    <Select
                                        name="Role"
                                        value={userFormData.Role}
                                        onValueChange={(value) =>
                                            handleUserChange({ name: "Role", value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HTX">HTX</SelectItem>
                                            <SelectItem value="QTD">Quản trị</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="Password">Mật khẩu</Label>
                                    <Input
                                        id="Password"
                                        name="Password"
                                        type="password"
                                        value={userFormData.Password}
                                        onChange={handleUserChange}
                                        required={!editingUserId}
                                    />
                                </div>
                                {(userFormData.Role === "HTX" || userFormData.Role === "QTD") && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="Type">Loại</Label>
                                            <Select
                                                name="Type"
                                                value={userFormData.Type}
                                                onValueChange={(value) =>
                                                    handleUserChange({ name: "Type", value })
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
                                        <div className="space-y-2">
                                            <Label htmlFor="OrganizationName">Tên tổ chức</Label>
                                            <Input
                                                id="OrganizationName"
                                                name="OrganizationName"
                                                value={userFormData.OrganizationName}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="Name">Tên</Label>
                                            <Input
                                                id="Name"
                                                name="Name"
                                                value={userFormData.Name}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ProvinceId">Tỉnh/Thành phố</Label>
                                            <Select
                                                name="ProvinceId"
                                                value={userFormData.ProvinceId}
                                                onValueChange={(value) =>
                                                    handleUserChange({ name: "ProvinceId", value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {provinces.map((province) => (
                                                        <SelectItem
                                                            key={province.id}
                                                            value={province.id.toString()}
                                                        >
                                                            {province.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="NumberCount">Số lượng</Label>
                                            <Input
                                                id="NumberCount"
                                                name="NumberCount"
                                                type="number"
                                                value={userFormData.NumberCount}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="EstablishedDate">Ngày thành lập</Label>
                                            <Input
                                                id="EstablishedDate"
                                                name="EstablishedDate"
                                                type="date"
                                                value={userFormData.EstablishedDate}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="Member">Thành viên</Label>
                                            <Input
                                                id="Member"
                                                name="Member"
                                                value={userFormData.Member}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="Status">Trạng thái</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Status"
                                                    name="Status"
                                                    checked={userFormData.Status}
                                                    onCheckedChange={(checked) =>
                                                        handleUserChange({
                                                            name: "Status",
                                                            value: checked,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor="Status">Hoạt động</Label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="Address">Địa chỉ</Label>
                                            <Textarea
                                                id="Address"
                                                name="Address"
                                                value={userFormData.Address}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="Position">Vị trí</Label>
                                            <Input
                                                id="Position"
                                                name="Position"
                                                value={userFormData.Position}
                                                onChange={handleUserChange}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUserDialogOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit">
                                    {editingUserId ? "Cập nhật" : "Thêm"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên đăng nhập</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead>Tên tổ chức</TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead>Tỉnh/Thành phố</TableHead>
                                <TableHead>Số lượng</TableHead>
                                <TableHead>Ngày thành lập</TableHead>
                                <TableHead>Thành viên</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Địa chỉ</TableHead>
                                <TableHead>Vị trí</TableHead>
                                <TableHead>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.Id}>
                                    <TableCell>{user.Username}</TableCell>
                                    <TableCell>{user.Email}</TableCell>
                                    <TableCell>{user.Role}</TableCell>
                                    <TableCell>{user.Type}</TableCell>
                                    <TableCell>{user.OrganizationName}</TableCell>
                                    <TableCell>{user.Name}</TableCell>
                                    <TableCell>
                                        {provinces.find((p) => p.id.toString() === user.ProvinceId)
                                            ?.name || user.ProvinceId}
                                    </TableCell>
                                    <TableCell>{user.NumberCount}</TableCell>
                                    <TableCell>{user.EstablishedDate}</TableCell>
                                    <TableCell>{user.Member}</TableCell>
                                    <TableCell>
                                        {user.Status ? "Hoạt động" : "Không hoạt động"}
                                    </TableCell>
                                    <TableCell>{user.Address}</TableCell>
                                    <TableCell>{user.Position}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteUser(user.Id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 