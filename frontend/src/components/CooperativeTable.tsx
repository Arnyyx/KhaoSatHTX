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
import { CooperativeForm } from "./CooperativeForm";

interface Cooperative {
    Id: number;
    Username: string;
    OrganizationName: string;
    Name: string;
    Role: "HTX" | "QTD";
    Email: string;
    Type: "NN" | "PNN";
    ProvinceId: number;
    WardId: number;
    Address: string;
    Position: string;
    NumberCount: number;
    EstablishedDate: string;
    Member: "TV" | "KTV";
    Status: boolean;
}

// Giả lập danh sách tỉnh và xã
const provinces = [
    { id: 1, name: "Hà Nội" },
    { id: 2, name: "TP. Hồ Chí Minh" },
    { id: 3, name: "Đà Nẵng" },
];
const wards = [
    { id: 1, name: "Xã Xuân Đỉnh", provinceId: 1 },
    { id: 2, name: "Xã Cổ Nhuế", provinceId: 1 },
    { id: 3, name: "Phường Bến Nghé", provinceId: 2 },
    { id: 4, name: "Phường Tân Định", provinceId: 2 },
    { id: 5, name: "Phường Hòa Hải", provinceId: 3 },
];

const cooperativeService = {
    getCooperatives: async (page: number, pageSize: number, searchQuery: string) => {
        const mockData: Cooperative[] = [
            {
                Id: 1,
                Username: "htx001",
                OrganizationName: "HTX Nông nghiệp Xuân Đỉnh",
                Name: "Nguyễn Văn A",
                Role: "HTX",
                Email: "htx001@gmail.com",
                Type: "NN",
                ProvinceId: 1,
                WardId: 1,
                Address: "123 Đường Xuân Đỉnh",
                Position: "Chủ tịch",
                NumberCount: 50,
                EstablishedDate: "2020-05-01",
                Member: "TV",
                Status: true,
            },
            {
                Id: 2,
                Username: "qtd002",
                OrganizationName: "Quỹ tín dụng Bến Nghé",
                Name: "Trần Thị B",
                Role: "QTD",
                Email: "qtd002@gmail.com",
                Type: "PNN",
                ProvinceId: 2,
                WardId: 3,
                Address: "456 Đường Lê Lợi",
                Position: "Giám đốc",
                NumberCount: 30,
                EstablishedDate: "2018-10-15",
                Member: "KTV",
                Status: false,
            },
        ];

        const filteredData = mockData.filter(
            (item) =>
                item.OrganizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.Username.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
            data: filteredData.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(filteredData.length / pageSize),
                totalItems: filteredData.length,
            },
        };
    },
    createCooperative: async (data: any) => {
        console.log("Create cooperative:", data);
        return { success: true };
    },
    updateCooperative: async (id: number, data: any) => {
        console.log(`Update cooperative ${id}:`, data);
        return { success: true };
    },
    deleteCooperative: async (id: number) => {
        console.log(`Delete cooperative ${id}`);
        return { success: true };
    },
    deleteMultipleCooperatives: async (ids: number[]) => {
        console.log(`Delete cooperatives: ${ids}`);
        return { success: true };
    },
};

export function CooperativeTable() {
    const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [sort, setSort] = useState({ column: "OrganizationName", direction: "asc" });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCooperative, setEditingCooperative] = useState<Cooperative | null>(null);

    const fetchCooperatives = async (searchQuery: string = "") => {
        try {
            const data = await cooperativeService.getCooperatives(page, 10, searchQuery);
            setCooperatives(data.data);
            setPagination(data.pagination);
        } catch (error: any) {
            toast.error("Lỗi khi lấy danh sách HTX/QTD", {
                description: error.message,
            });
        }
    };

    useEffect(() => {
        fetchCooperatives(search);
    }, [page, search]);

    const handleSort = (column: string) => {
        setSort({
            column,
            direction: sort.column === column && sort.direction === "asc" ? "desc" : "asc",
        });
    };

    const handleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async (data: any) => {
        try {
            await cooperativeService.createCooperative(data);
            setIsCreateOpen(false);
            fetchCooperatives(search);
            toast.success("Tạo HTX/QTD thành công");
        } catch (error: any) {
            toast.error("Lỗi khi tạo HTX/QTD", {
                description: error.message,
            });
        }
    };

    const handleUpdate = async (data: any) => {
        if (editingCooperative) {
            try {
                await cooperativeService.updateCooperative(editingCooperative.Id, data);
                setIsEditOpen(false);
                setEditingCooperative(null);
                fetchCooperatives(search);
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
            await cooperativeService.deleteCooperative(id);
            fetchCooperatives(search);
            toast.success("Xóa HTX/QTD thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa HTX/QTD", {
                description: error.message,
            });
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            await cooperativeService.deleteMultipleCooperatives(selected);
            setSelected([]);
            fetchCooperatives(search);
            toast.success("Xóa nhiều HTX/QTD thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa nhiều HTX/QTD", {
                description: error.message,
            });
        }
    };

    const sortedCooperatives = [...cooperatives].sort((a, b) => {
        const factor = sort.direction === "asc" ? 1 : -1;
        const aValue = a[sort.column as keyof Cooperative];
        const bValue = b[sort.column as keyof Cooperative];
        return aValue > bValue ? factor : -factor;
    });

    // Hàm ánh xạ ProvinceId và WardId sang tên
    const getProvinceName = (provinceId: number) => {
        return provinces.find((p) => p.id === provinceId)?.name || "-";
    };

    const getWardName = (wardId: number) => {
        return wards.find((w) => w.id === wardId)?.name || "-";
    };

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
                            <CooperativeForm
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
                                checked={selected.length === cooperatives.length}
                                onChange={() =>
                                    setSelected(
                                        selected.length === cooperatives.length
                                            ? []
                                            : cooperatives.map((c) => c.Id)
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
                        <TableHead>Tỉnh</TableHead>
                        <TableHead>Xã</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("EstablishedDate")}
                                className="flex items-center space-x-1"
                            >
                                <span>Ngày thành lập</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("Member")}
                                className="flex items-center space-x-1"
                            >
                                <span>Thành viên</span>
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
                        <TableHead>Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedCooperatives.map((cooperative) => (
                        <TableRow key={cooperative.Id} className="hover:bg-gray-50">
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(cooperative.Id)}
                                    onChange={() => handleSelect(cooperative.Id)}
                                />
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{cooperative.Username}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                                {cooperative.OrganizationName}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{cooperative.Name}</TableCell>
                            <TableCell>{cooperative.Role}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{cooperative.Email}</TableCell>
                            <TableCell>{cooperative.Type === "NN" ? "Nông nghiệp" : "Phi nông nghiệp"}</TableCell>
                            <TableCell>{getProvinceName(cooperative.ProvinceId)}</TableCell>
                            <TableCell>{getWardName(cooperative.WardId)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{cooperative.Address}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{cooperative.Position}</TableCell>
                            <TableCell>{cooperative.NumberCount}</TableCell>
                            <TableCell>
                                {cooperative.EstablishedDate
                                    ? new Date(cooperative.EstablishedDate).toLocaleDateString()
                                    : "-"}
                            </TableCell>
                            <TableCell>{cooperative.Member === "TV" ? "Thành viên" : "Không thành viên"}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={cooperative.Status ? "default" : "destructive"}
                                    className={cooperative.Status ? "bg-green-500" : "bg-red-500"}
                                >
                                    {cooperative.Status ? "Hoạt động" : "Không hoạt động"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingCooperative(cooperative)}
                                        >
                                            Sửa
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Sửa HTX/QTD</DialogTitle>
                                        </DialogHeader>
                                        <CooperativeForm
                                            initialData={editingCooperative || undefined}
                                            onSubmit={handleUpdate}
                                            onCancel={() => {
                                                setIsEditOpen(false);
                                                setEditingCooperative(null);
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(cooperative.Id)}
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
                <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Trang trước
                </Button>
                <span>
                    Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Trang sau
                </Button>
            </div>
        </div>
    );
}