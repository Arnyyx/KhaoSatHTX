"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
    Id: number;
    Username: string;
    Name: string | null;
    Email: string;
    Role: "LMHTX" | "QTD" | "HTX" | "admin";
    Status: boolean | null;
    IsLocked: boolean | null;
    OrganizationName?: string | null;
    Type?: "PNN" | "NN";
    ProvinceId?: number | null;
    WardId?: number | null;
    Address?: string | null;
    Position?: string | null;
    NumberCount?: number | null;
    EstablishedDate?: string | null;
    Member?: string | null;
    SurveyStatus?: boolean | null;
    SurveyTime?: number | null;
    Province?: { Name: string } | null;
    Ward?: { Name: string } | null;
}

export function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [sort, setSort] = useState({ column: "Username", direction: "asc" });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async (searchQuery: string = "") => {
        try {
            const data = await userService.getUsers(page, 10, searchQuery);
            setUsers(data.rows);
            setPagination({
                currentPage: page,
                totalPages: Math.ceil(data.count / 10),
                totalItems: data.count,
            });
        } catch (error: any) {
            toast.error("Lỗi khi lấy danh sách người dùng", {
                description: error.message,
            });
        }
    };


    useEffect(() => {
        fetchUsers(search);
    }, [page, search]);

    const handleSort = (column: string) => {
        setSort({
            column,
            direction:
                sort.column === column && sort.direction === "asc" ? "desc" : "asc",
        });
    };

    const handleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async (data: any) => {
        try {
            await userService.createUser(data);
            setIsCreateOpen(false);
            fetchUsers(search);
            toast.success("Tạo người dùng thành công");
        } catch (error: any) {
            toast.error("Lỗi khi tạo người dùng", {
                description: error.message,
            });
        }
    };

    const handleUpdate = async (data: any) => {
        if (editingUser) {
            try {
                await userService.updateUser(editingUser.Id, data);
                setIsEditOpen(false);
                setEditingUser(null);
                fetchUsers(search);
                toast.success("Cập nhật người dùng thành công");
            } catch (error: any) {
                toast.error("Lỗi khi cập nhật người dùng", {
                    description: error.message,
                });
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await userService.deleteUser(id);
            fetchUsers(search);
            toast.success("Xóa người dùng thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa người dùng", {
                description: error.message,
            });
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            await userService.deleteMultipleUsers(selected);
            setSelected([]);
            fetchUsers(search);
            toast.success("Xóa nhiều người dùng thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa nhiều người dùng", {
                description: error.message,
            });
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        const factor = sort.direction === "asc" ? 1 : -1;
        if (sort.column === "Province.Name") {
            const valueA = a.Province?.Name || "";
            const valueB = b.Province?.Name || "";
            return valueA > valueB ? factor : -factor;
        }
        if (sort.column === "Ward.Name") {
            const valueA = a.Ward?.Name || "";
            const valueB = b.Ward?.Name || "";
            return valueA > valueB ? factor : -factor;
        }
        const valueA = a[sort.column as keyof User] ?? "";
        const valueB = b[sort.column as keyof User] ?? "";
        return valueA > valueB ? factor : -factor;
    });

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <div className="space-x-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tạo Người Dùng</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo Người Dùng Mới</DialogTitle>
                            </DialogHeader>
                            <UserForm
                                onSubmit={handleCreate}
                                onCancel={() => setIsCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                    {selected.length > 0 && (
                        <Button variant="destructive" onClick={handleDeleteMultiple}>
                            Xóa Đã Chọn ({selected.length})
                        </Button>
                    )}
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <input
                                type="checkbox"
                                checked={selected.length === users.length}
                                onChange={() =>
                                    setSelected(
                                        selected.length === users.length
                                            ? []
                                            : users.map((u) => u.Id)
                                    )
                                }
                            />
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Username")}
                                className="flex items-center space-x-1"
                            >
                                <span>Tên đăng nhập</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Name")}
                                className="flex items-center space-x-1"
                            >
                                <span>Họ tên</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Email")}
                                className="flex items-center space-x-1"
                            >
                                <span>Email</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Province.Name")} // Sắp xếp theo Province.Name
                                className="flex items-center space-x-1"
                            >
                                <span>Tỉnh</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Ward.Name")} // Sắp xếp theo Ward.Name
                                className="flex items-center space-x-1"
                            >
                                <span>Phường/Xã</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Role")}
                                className="flex items-center space-x-1"
                            >
                                <span>Vai trò</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Status")}
                                className="flex items-center space-x-1"
                            >
                                <span>Trạng thái</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("IsLocked")}
                                className="flex items-center space-x-1"
                            >
                                <span>Khóa</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedUsers.map((user) => (
                        <TableRow key={user.Id} className="hover:bg-gray-50">
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(user.Id)}
                                    onChange={() => handleSelect(user.Id)}
                                />
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{user.Username}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{user.Name || "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{user.Email}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{user.Province?.Name || "-"}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{user.Ward?.Name || "-"}</TableCell>
                            <TableCell>{user.Role}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={user.Status ? "default" : "destructive"}
                                    className={user.Status ? "bg-green-500" : "bg-red-500"}
                                >
                                    {user.Status ? "Hoạt động" : "Không hoạt động"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={user.IsLocked ? "destructive" : "default"}
                                    className={user.IsLocked ? "bg-red-500" : "bg-green-500"}
                                >
                                    {user.IsLocked ? "Khóa" : "Mở"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingUser(user)}
                                        >
                                            Sửa
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Sửa Người Dùng</DialogTitle>
                                        </DialogHeader>
                                        <UserForm
                                            initialData={editingUser || undefined}
                                            onSubmit={handleUpdate}
                                            onCancel={() => {
                                                setIsEditOpen(false);
                                                setEditingUser(null);
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(user.Id)}
                                    className="ml-2"
                                >
                                    Xóa
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-between mt-4">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Trước
                </Button>
                <span>
                    Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Tiếp
                </Button>
            </div>
        </div>
    );
}