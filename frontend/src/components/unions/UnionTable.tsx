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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UnionForm } from "./UnionForm";
import { User } from "@/types/user";
import { userService } from "@/lib/api";
import Cookies from "js-cookie";

export function UnionTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [sort, setSort] = useState({ column: "Username", direction: "ASC" });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const userId = Cookies.get("userId");
        if (userId) {
            userService.getUserById(parseInt(userId))
                .then(response => {
                    setCurrentUser(response.user);
                })
                .catch(error => {
                    toast.error("Lỗi khi lấy thông tin người dùng");
                    console.error(error);
                });
        }
    }, []);

    const fetchUsers = async (searchQuery: string = "") => {
        if (!currentUser?.ProvinceId) return;

        try {
            const data = await userService.getUsersByProvince(
                currentUser.ProvinceId,
                page,
                10,
                searchQuery,
                sort.column,
                sort.direction
            );
            setUsers(data.items);
            setPagination({ total: data.total });
        } catch (error: any) {
            toast.error("Lỗi khi lấy danh sách HTX/QTD", {
                description: error.message,
            });
        }
    };

    useEffect(() => {
        if (currentUser?.ProvinceId) {
            fetchUsers(search);
        }
    }, [page, search, sort, currentUser]);

    const handleSort = (column: string) => {
        setSort({
            column,
            direction: sort.column === column && sort.direction === "ASC" ? "DESC" : "ASC",
        });
    };

    const handleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async (data: any) => {
        try {
            await userService.createUser({
                ...data,
                ProvinceId: currentUser?.ProvinceId,
                Role: "HTX"
            });
            setIsCreateOpen(false);
            fetchUsers(search);
            toast.success("Tạo HTX/QTD thành công");
        } catch (error: any) {
            toast.error("Lỗi khi tạo HTX/QTD", {
                description: error.message,
            });
        }
    };

    const handleUpdate = async (data: any) => {
        if (editingUser) {
            try {
                await userService.updateUser(editingUser.Id, {
                    ...data,
                    ProvinceId: currentUser?.ProvinceId,
                    Role: "HTX"
                });
                setIsEditOpen(false);
                setEditingUser(null);
                fetchUsers(search);
                toast.success("Cập nhật HTX/QTD thành công");
            } catch (error: any) {
                toast.error("Lỗi khi cập nhật HTX/QTD", {
                    description: error.message,
                });
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await userService.deleteUser(id);
            fetchUsers(search);
            toast.success("Xóa HTX/QTD thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa HTX/QTD", {
                description: error.message,
            });
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            await userService.deleteMultipleUsers(selected);
            setSelected([]);
            fetchUsers(search);
            toast.success("Xóa nhiều HTX/QTD thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa nhiều HTX/QTD", {
                description: error.message,
            });
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        const factor = sort.direction === "ASC" ? 1 : -1;
        const aValue = a[sort.column as keyof User] ?? "";
        const bValue = b[sort.column as keyof User] ?? "";
        return aValue > bValue ? factor : -factor;
    });

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <Input
                    placeholder="Tìm kiếm HTX/QTD..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <div className="space-x-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tạo HTX/QTD</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px] overflow-y-auto h-5/6">
                            <DialogHeader>
                                <DialogTitle>Tạo mới HTX/QTD</DialogTitle>
                            </DialogHeader>
                            <UnionForm
                                onSubmit={handleCreate}
                                onCancel={() => setIsCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                    {selected.length > 0 && (
                        <Button variant="destructive" onClick={handleDeleteMultiple}>
                            Xóa đã chọn ({selected.length})
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
                                aria-label="Chọn tất cả"
                                title="Chọn tất cả"
                            />
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Username")}
                                className="flex items-center space-x-1"
                            >
                                <span>Username</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("OrganizationName")}
                                className="flex items-center space-x-1"
                            >
                                <span>Tên tổ chức</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Name")}
                                className="flex items-center space-x-1"
                            >
                                <span>Người quản lý</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Role")}
                                className="flex items-center space-x-1"
                            >
                                <span>Loại</span>
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
                                onClick={() => handleSort("Type")}
                                className="flex items-center space-x-1"
                            >
                                <span>Loại hình</span>
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
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedUsers.map((user) => (
                        <TableRow key={user.Id}>
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(user.Id)}
                                    onChange={() => handleSelect(user.Id)}
                                    aria-label={`Chọn ${user.Username}`}
                                    title={`Chọn ${user.Username}`}
                                />
                            </TableCell>
                            <TableCell>{user.Username}</TableCell>
                            <TableCell>{user.OrganizationName}</TableCell>
                            <TableCell>{user.Name}</TableCell>
                            <TableCell>{user.Role}</TableCell>
                            <TableCell>{user.Email}</TableCell>
                            <TableCell>{user.Type}</TableCell>
                            <TableCell>
                                <Badge variant={user.Status ? "default" : "destructive"}>
                                    {user.Status ? "Hoạt động" : "Ngừng hoạt động"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingUser(user);
                                            setIsEditOpen(true);
                                        }}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(user.Id)}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[900px] overflow-y-auto h-5/6">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa HTX/QTD</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <UnionForm
                            user={editingUser}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                                setIsEditOpen(false);
                                setEditingUser(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}