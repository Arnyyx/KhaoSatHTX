"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Download, Eye, FileSpreadsheet, Filter, MoreHorizontal, Pencil, Settings, Trash, Upload, Undo, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UnionForm } from "./UnionForm";
import { User } from "@/types/user";
import { API } from "@/lib/api"
import { userService, wardService } from "@/lib/api";
import Cookies from "js-cookie";
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { excelUtils } from "../../lib/excel-utils";
import { Lock } from "lucide-react"

export function UnionTable() {
    const year = new Date().getFullYear();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [sort, setSort] = useState({ column: "Username", direction: "ASC" });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
        const router = useRouter();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [filters, setFilters] = useState({
        role: "",
        type: "",
        status: "",
        wardId: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const [wardMap, setWardMap] = useState<Map<number, string>>(new Map());
    const [deletingAllConfirm, setDeletingAllConfirm] = useState(false);
    const [localSort, setLocalSort] = useState<{
        column: string | null;
        direction: "ASC" | "DESC";
    }>({ column: null, direction: "ASC" });

    // Column visibility state
    const [columnVisibility, setColumnVisibility] = useState({
        username: true,
        organizationName: true,
        name: true,
        role: true,
        email: true,
        type: true,
        ward: true,
        status: true,
    });


    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isMultiDeleteConfirmOpen, setIsMultiDeleteConfirmOpen] = useState(false);
    const [recentlyDeleted, setRecentlyDeleted] = useState<User[]>([]);

    // New state variables for import
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importData, setImportData] = useState<any[]>([]);
    const [importErrors, setImportErrors] = useState<Record<number, Record<string, string>>>({});
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [wards, setWards] = useState<{ Id: number; Name: string }[]>([]);

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
                pageSize,
                searchQuery,
                sort.column,
                sort.direction
            );
            setUsers(data.items);
            setPagination({ total: data.total, totalPages: Math.ceil(data.total / pageSize) });
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
    }, [page, pageSize, search, sort, currentUser]);

    const handleSort = (column: string) => {
        setSort({
            column,
            direction: sort.column === column && sort.direction === "ASC" ? "DESC" : "ASC",
        });
    };

    const handleWardSort = () => {
        setLocalSort(prev => ({
            column: "ward",
            direction: prev.column === "ward" && prev.direction === "ASC" ? "DESC" : "ASC"
        }));
    };

    const handleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async (data: any) => {
        try {
            // Format the data to match backend expectations
            const formattedData = {
                Username: data.username,
                Password: data.password,
                OrganizationName: data.organizationName,
                Name: data.name,
                Role: data.role,
                Email: data.email || "",
                Type: data.type,
                WardId: data.wardId,
                Address: data.address,
                Position: data.position,
                MemberCount: data.memberCount,
                EstablishedDate: data.establishedDate,
                IsMember: data.isMember,
                Status: data.status,
                ProvinceId: currentUser?.ProvinceId
            };

            console.log("Creating HTX/QTD with data:", formattedData);
            const response = await userService.createUser(formattedData);

            setIsCreateOpen(false);
            fetchUsers(search);
            toast.success("Tạo HTX/QTD thành công");
        } catch (error: any) {
            console.error("Error creating HTX/QTD:", error);
            const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi";
            toast.error("Lỗi khi tạo HTX/QTD", {
                description: errorMessage,
            });
        }
    };

    const handleUpdate = async (data: any) => {
        if (editingUser) {
            try {
                // Format the data to match backend expectations
                const formattedData = {
                    Username: data.username,
                    Password: data.password || undefined,
                    OrganizationName: data.organizationName,
                    Name: data.name,
                    Role: data.role,
                    Email: data.email || "",
                    Type: data.type,
                    WardId: data.wardId,
                    Address: data.address,
                    Position: data.position,
                    MemberCount: data.memberCount,
                    EstablishedDate: data.establishedDate,
                    IsMember: data.isMember,
                    Status: data.status,
                    ProvinceId: currentUser?.ProvinceId
                };

                console.log("Updating HTX/QTD with data:", formattedData);
                await userService.updateUser(editingUser.Id, formattedData);

                setIsEditOpen(false);
                setEditingUser(null);
                fetchUsers(search);
                toast.success("Cập nhật HTX/QTD thành công");
            } catch (error: any) {
                console.error("Error updating HTX/QTD:", error);
                const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi";
                toast.error("Lỗi khi cập nhật HTX/QTD", {
                    description: errorMessage,
                });
            }
        }
    };

    const confirmDelete = (user: User) => {
        setDeletingUser(user);
        setIsDeleteConfirmOpen(true);
    };

    const confirmMultiDelete = () => {
        setIsMultiDeleteConfirmOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const userToDelete = users.find(u => u.Id === id);
            if (userToDelete) {
                setRecentlyDeleted(prev => [...prev, userToDelete]);
            }

            await userService.deleteUser(id);
            fetchUsers(search);

            toast.success("Xóa HTX/QTD thành công", {
                action: {
                    label: "Hoàn tác",
                    onClick: async () => {
                        try {
                            if (userToDelete) {
                                const { Id, ...userData } = userToDelete;
                                await userService.createUser(userData);
                                fetchUsers(search);
                                setRecentlyDeleted(prev => prev.filter(u => u.Id !== id));
                                toast.success("Đã hoàn tác thao tác xóa");
                            }
                        } catch (error) {
                            console.error("Error undoing delete:", error);
                            toast.error("Không thể hoàn tác thao tác xóa");
                        }
                    }
                }
            });
        } catch (error: any) {
            console.error("Error deleting HTX/QTD:", error);
            const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi";
            toast.error("Lỗi khi xóa HTX/QTD", {
                description: errorMessage,
            });
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            const usersToDelete = users.filter(u => selected.includes(u.Id));
            setRecentlyDeleted(prev => [...prev, ...usersToDelete]);

            await userService.deleteMultipleUsers(selected);
            setSelected([]);
            fetchUsers(search);

            toast.success(`Đã xóa ${selected.length} HTX/QTD thành công`, {
                action: {
                    label: "Hoàn tác",
                    onClick: async () => {
                        try {
                            let success = 0;
                            for (const user of usersToDelete) {
                                const { Id, ...userData } = user;
                                await userService.createUser(userData);
                                success++;
                            }
                            fetchUsers(search);
                            setRecentlyDeleted(prev => prev.filter(u => !usersToDelete.some(deleted => deleted.Id === u.Id)));
                            toast.success(`Đã hoàn tác thao tác xóa ${success} HTX/QTD`);
                        } catch (error) {
                            console.error("Error undoing multiple delete:", error);
                            toast.error("Không thể hoàn tác toàn bộ thao tác xóa");
                        }
                    }
                }
            });
        } catch (error: any) {
            console.error("Error deleting multiple HTX/QTD:", error);
            const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi";
            toast.error("Lỗi khi xóa nhiều HTX/QTD", {
                description: errorMessage,
            });
        }
    };

    const handleDeleteAll = async () => {
        try {
            const allIds = users.map(user => user.Id);
            setRecentlyDeleted(prev => [...prev, ...users]);
            await userService.deleteMultipleUsers(allIds);

            fetchUsers(search);
            setDeletingAllConfirm(false);

            toast.success(`Đã xóa tất cả ${allIds.length} HTX/QTD thành công`, {
                action: {
                    label: "Hoàn tác",
                    onClick: async () => {
                        try {
                            let success = 0;
                            for (const user of users) {
                                const { Id, ...userData } = user;
                                await userService.createUser(userData);
                                success++;
                            }
                            fetchUsers(search);
                            setRecentlyDeleted([]);
                            toast.success(`Đã hoàn tác thao tác xóa ${success} HTX/QTD`);
                        } catch (error) {
                            console.error("Error undoing mass delete:", error);
                            toast.error("Không thể hoàn tác toàn bộ thao tác xóa");
                        }
                    }
                }
            });
        } catch (error: any) {
            console.error("Error deleting all HTX/QTDs:", error);
            const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi";
            toast.error("Lỗi khi xóa tất cả HTX/QTD", {
                description: errorMessage,
            });
        }
    };


    const sortedUsers = useMemo(() => {
        let result = [...users];

        if (localSort.column === "ward") {
            result = result.sort((a, b) => {
                const factor = localSort.direction === "ASC" ? 1 : -1;
                const wardNameA = wardMap.get(a.WardId || 0) || "";
                const wardNameB = wardMap.get(b.WardId || 0) || "";
                return wardNameA.localeCompare(wardNameB) * factor;
            });
        } else {
            result = result.sort((a, b) => {
                const factor = sort.direction === "ASC" ? 1 : -1;
                const aValue = a[sort.column as keyof User] ?? "";
                const bValue = b[sort.column as keyof User] ?? "";
                return aValue > bValue ? factor : -factor;
            });
        }

        return result;
    }, [users, sort, localSort, wardMap]);


    // Apply client-side filtering
    const filteredUsers = sortedUsers.filter(user => {
        if (filters.role && user.Role !== filters.role) return false;
        if (filters.type && user.Type !== filters.type) return false;
        if (filters.status === "active" && !user.Status) return false;
        if (filters.status === "inactive" && user.Status) return false;
        if (filters.wardId && user.WardId !== Number(filters.wardId)) return false;
        return true;
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filters change
    };

    const resetFilters = () => {
        setFilters({
            role: "",
            type: "",
            status: "",
            wardId: ""
        });
    };

    // Function to export data to Excel
    const exportToExcel = () => {
        try {
            excelUtils.exportUnionsToExcel(filteredUsers, wards);

            toast.success("Xuất dữ liệu thành công", {
                description: `Đã xuất ${filteredUsers.length} bản ghi`
            });
        } catch (error: any) {
            console.error("Error exporting to Excel:", error);
            toast.error("Lỗi khi xuất dữ liệu", {
                description: error.message,
            });
        }
    };

    // Function to handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
            parseExcelFile(file);
        }
    };

    // Function to parse Excel file
    const parseExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    toast.error("Không thể đọc dữ liệu từ file");
                    return;
                }

                const parsedData = excelUtils.parseExcelFile(data);
                if (!parsedData || parsedData.length === 0) {
                    toast.error("File không chứa dữ liệu hợp lệ");
                    return;
                }

                setImportData(parsedData);
                validateImportData(parsedData);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                toast.error("Lỗi khi đọc file Excel");
            }
        };
        reader.onerror = () => {
            toast.error("Lỗi khi đọc file");
        };
        reader.readAsBinaryString(file);
    };

    // Function to validate import data
    const validateImportData = (data: any[]) => {
        const errors = excelUtils.validateUnionImportData(data, wards);
        setImportErrors(errors);
    };


    // Function to handle import
    // In frontend/src/components/unions/UnionTable.tsx
    const handleImport = async () => {
        if (!importFile) {
            toast.error("Vui lòng chọn file Excel");
            return;
        }

        try {
            setIsImporting(true);

            const response = await userService.importUsers(importFile);

            // Reset import state
            setImportFile(null);
            setImportData([]);
            setImportErrors({});
            setIsImportDialogOpen(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }


            if (response.duplicateUsernames && response.duplicateUsernames.length > 0) {
                toast.error("Lỗi trùng username", {
                    description: `Các username sau đã tồn tại trong hệ thống: ${response.duplicateUsernames.join(', ')}`
                });
            }
            toast.success(`Đã nhập ${response.created} bản ghi`);
            fetchUsers(search);
        } catch (error: any) {
            console.error("Error importing data:", error);
            toast.error("Lỗi khi xử lý dữ liệu Excel", {
                description: error.response?.data?.message || error.message
            });
        } finally {
            setIsImporting(false);
        }
    };

    // Function to download template
    const downloadTemplate = () => {
        try {
            excelUtils.downloadUnionTemplate();
            toast.success("Tải mẫu nhập liệu thành công");
        } catch (error: any) {
            console.error("Error downloading template:", error);
            toast.error("Lỗi khi tải mẫu nhập liệu", {
                description: error.message,
            });
        }
    };

    // Function to toggle column visibility
    const toggleColumnVisibility = (column: string) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column as keyof typeof prev]
        }));
    };

    // Function to reset column visibility
    const resetColumnVisibility = () => {
        setColumnVisibility({
            username: true,
            organizationName: true,
            name: true,
            role: true,
            email: true,
            type: true,
            ward: true,
            status: true,
        });
    };

    // Fetch wards for validation
    useEffect(() => {
        if (currentUser?.ProvinceId) {
            wardService.getWardsByProvinceId(currentUser.ProvinceId)
                .then((response: { items: { Id: number; Name: string }[] }) => {
                    setWards(response.items);
                    const map = new Map<number, string>();
                    response.items.forEach(ward => {
                        map.set(ward.Id, ward.Name);
                    });
                    setWardMap(map);
                })
                .catch((error: any) => {
                    console.error("Error fetching wards:", error);
                });
        }
    }, [currentUser?.ProvinceId]);


    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Tìm kiếm HTX/QTD..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />

                    {/* Replace select with DropdownMenu for page size */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                                {pageSize} / trang
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Số dòng mỗi trang</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                setPageSize(5);
                                setPage(1);
                            }}>
                                5 / trang
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setPageSize(10);
                                setPage(1);
                            }}>
                                10 / trang
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setPageSize(20);
                                setPage(1);
                            }}>
                                20 / trang
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setPageSize(50);
                                setPage(1);
                            }}>
                                50 / trang
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filter toggle button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="ml-2"
                    >
                        {showFilters ? (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Ẩn bộ lọc
                            </>
                        ) : (
                            <>
                                <Filter className="mr-2 h-4 w-4" />
                                Hiện bộ lọc
                            </>
                        )}
                    </Button>

                    {/* Column visibility toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                                <Settings className="mr-2 h-4 w-4" />
                                Cột
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.username}
                                onCheckedChange={() => toggleColumnVisibility('username')}
                            >
                                Username
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.organizationName}
                                onCheckedChange={() => toggleColumnVisibility('organizationName')}
                            >
                                Tên tổ chức
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.name}
                                onCheckedChange={() => toggleColumnVisibility('name')}
                            >
                                Người quản lý
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.ward}
                                onCheckedChange={() => toggleColumnVisibility('ward')}
                            >
                                Phường/Xã
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.role}
                                onCheckedChange={() => toggleColumnVisibility('role')}
                            >
                                Loại
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.email}
                                onCheckedChange={() => toggleColumnVisibility('email')}
                            >
                                Email
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.type}
                                onCheckedChange={() => toggleColumnVisibility('type')}
                            >
                                Loại hình
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.status}
                                onCheckedChange={() => toggleColumnVisibility('status')}
                            >
                                Trạng thái
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={resetColumnVisibility}>
                                Mặc định
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex space-x-2">
                    { Cookies.get("userRole") === "LMHTX" ? 
                    <Button
                        onClick={async () => {
                            const confirmEnd = window.confirm(`Bạn có chắc chắn muốn kết thúc khảo sát năm ${year}? Các Thành viên HTX thuộc tỉnh của bạn sẽ không thể tham gia khảo sát nữa.`);
                            if (confirmEnd) {
                                try {
                                const res = await fetch(`${API.users}/lock`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ province_id: Cookies.get("provinceId") , year: year, user_id: Cookies.get("userId") }),
                                });
                                const data = await res.json();
                                toast.success(data.message || "Khảo sát đã được kết thúc thành công.");
                                // Refresh the page to reflect changes
                                router.refresh();
                                } catch (error) {
                                    console.error("Error ending survey:", error);
                                    toast.error("Lỗi khi kết thúc khảo sát.");
                                }
                            }   
                        }}
                        className="flex items-center gap-2"
                    >
                        <Lock className="h-4 w-4" />
                        Kết thúc khảo sát năm {year}
                    </Button>
                    : null}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Excel
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={exportToExcel}>
                                <Download className="h-4 w-4 mr-2" />
                                Xuất Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                                <Upload className="h-4 w-4 mr-2" />
                                Nhập Excel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={downloadTemplate}>
                                <Download className="h-4 w-4 mr-2" />
                                Tải mẫu nhập liệu
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                        <Button variant="destructive" onClick={confirmMultiDelete}>
                            Xoá đã chọn ({selected.length})
                        </Button>
                    )}
                    {users.length > 0 && selected.length === 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setDeletingAllConfirm(true);
                            }}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            Xóa tất cả
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-md mb-4 flex gap-4 flex-wrap">
                    <div>
                        <label className="block text-sm font-medium mb-1">Loại</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {filters.role ? (
                                        filters.role === "HTX" ? "Hợp tác xã" : "Quỹ tín dụng"
                                    ) : "Tất cả"}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleFilterChange("role", "")}>
                                    Tất cả
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange("role", "HTX")}>
                                    Hợp tác xã
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange("role", "QTD")}>
                                    Quỹ tín dụng
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Loại hình</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {filters.type ? (
                                        filters.type === "NN" ? "Nông nghiệp" : "Phi nông nghiệp"
                                    ) : "Tất cả"}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleFilterChange("type", "")}>
                                    Tất cả
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange("type", "NN")}>
                                    Nông nghiệp
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange("type", "PNN")}>
                                    Phi nông nghiệp
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phường/Xã</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {filters.wardId ? (
                                        wardMap.get(Number(filters.wardId)) || "Không xác định"
                                    ) : "Tất cả"}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-60 overflow-y-auto">
                                <DropdownMenuItem onClick={() => handleFilterChange("wardId", "")}>
                                    Tất cả
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {wards.map((ward) => (
                                    <DropdownMenuItem
                                        key={ward.Id}
                                        onClick={() => handleFilterChange("wardId", ward.Id.toString())}
                                    >
                                        {ward.Name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {filters.status ? (
                                        filters.status === "active" ? "Hoạt động" : "Ngừng hoạt động"
                                    ) : "Tất cả"}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleFilterChange("status", "")}>
                                    Tất cả
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange("status", "active")}>
                                    Hoạt động
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange("status", "inactive")}>
                                    Ngừng hoạt động
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-end">
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <input
                                type="checkbox"
                                checked={selected.length === users.length && users.length > 0}
                                onChange={() =>
                                    setSelected(
                                        selected.length === users.length
                                            ? []
                                            : users.map((u) => u.Id)
                                    )
                                }
                                aria-label="Chọn tất cả"
                                title="Chọn tất cả"
                                disabled={users.length === 0}
                            />
                        </TableHead>
                        <TableHead className="w-[80px]">Thao tác</TableHead>
                        {columnVisibility.username && (
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
                        )}
                        {columnVisibility.organizationName && (
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
                        )}
                        {columnVisibility.name && (
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
                        )}
                        {columnVisibility.ward && (
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={handleWardSort}
                                    className="flex items-center space-x-1"
                                >
                                    <span>Phường/Xã</span>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                        )}
                        {columnVisibility.role && (
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
                        )}
                        {columnVisibility.email && (
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
                        )}
                        {columnVisibility.type && (
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
                        )}
                        {columnVisibility.status && (
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
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8 + Object.values(columnVisibility).filter(Boolean).length} className="text-center py-8">
                                Không có dữ liệu
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredUsers.map((user) => (
                            <TableRow
                                key={user.Id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                    setViewingUser(user);
                                    setIsViewOpen(true);
                                }}
                            >
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(user.Id)}
                                        onChange={() => handleSelect(user.Id)}
                                        aria-label={`Chọn ${user.Username}`}
                                        title={`Chọn ${user.Username}`}
                                    />
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Mở menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => confirmDelete(user)}
                                                    className="text-red-600"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                                {columnVisibility.username && <TableCell>{user.Username}</TableCell>}
                                {columnVisibility.organizationName && <TableCell>{user.OrganizationName}</TableCell>}
                                {columnVisibility.name && <TableCell>{user.Name}</TableCell>}
                                {columnVisibility.ward && (
                                    <TableCell>
                                        {wardMap.get(user.WardId || 0) || "-"}
                                    </TableCell>
                                )}
                                {columnVisibility.role && <TableCell>{user.Role}</TableCell>}
                                {columnVisibility.email && <TableCell>{user.Email || "-"}</TableCell>}
                                {columnVisibility.type && <TableCell>{user.Type}</TableCell>}
                                {columnVisibility.status && (
                                    <TableCell>
                                        <Badge variant={user.Status ? "default" : "destructive"}>
                                            {user.Status ? "Hoạt động" : "Ngừng hoạt động"}
                                        </Badge>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                    {pagination.total ? `Hiển thị ${Math.min((page - 1) * pageSize + 1, pagination.total)} - ${Math.min(page * pageSize, pagination.total)} trong số ${pagination.total} kết quả` : "Không có kết quả"}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page => Math.max(1, page - 1))}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {pagination.totalPages && pagination.totalPages <= 5 ? (
                        Array.from({ length: pagination.totalPages }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={page === i + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))
                    ) : (
                        <>
                            {page > 2 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(1)}
                                >
                                    1
                                </Button>
                            )}
                            {page > 3 && <span>...</span>}
                            {page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                >
                                    {page - 1}
                                </Button>
                            )}
                            <Button variant="default" size="sm">
                                {page}
                            </Button>
                            {page < pagination.totalPages && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                >
                                    {page + 1}
                                </Button>
                            )}
                            {page < pagination.totalPages - 2 && <span>...</span>}
                            {page < pagination.totalPages - 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(pagination.totalPages)}
                                >
                                    {pagination.totalPages}
                                </Button>
                            )}
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page => Math.min(pagination.totalPages || 1, page + 1))}
                        disabled={!pagination.totalPages || page >= pagination.totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* View Details Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết HTX/QTD</DialogTitle>
                    </DialogHeader>
                    {viewingUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Username:</span>
                                <span className="col-span-2">{viewingUser.Username}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Tên tổ chức:</span>
                                <span className="col-span-2">{viewingUser.OrganizationName}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Người quản lý:</span>
                                <span className="col-span-2">{viewingUser.Name}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Loại:</span>
                                <span className="col-span-2">{viewingUser.Role}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Email:</span>
                                <span className="col-span-2">{viewingUser.Email}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Loại hình:</span>
                                <span className="col-span-2">
                                    {viewingUser.Type === "NN" ? "Nông nghiệp" : "Phi nông nghiệp"}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Phường/Xã:</span>
                                <span className="col-span-2">
                                    {wardMap.get(viewingUser.WardId || 0) || "Chưa có thông tin"}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Địa chỉ:</span>
                                <span className="col-span-2">{viewingUser.Address}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Ngày thành lập:</span>
                                <span className="col-span-2">
                                    {viewingUser.EstablishedDate
                                        ? new Date(viewingUser.EstablishedDate).toLocaleDateString("vi-VN")
                                        : "Chưa có thông tin"}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Số thành viên:</span>
                                <span className="col-span-2">{viewingUser.MemberCount || 0}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Trạng thái:</span>
                                <span className="col-span-2">
                                    <Badge variant={viewingUser.Status ? "default" : "destructive"}>
                                        {viewingUser.Status ? "Hoạt động" : "Ngừng hoạt động"}
                                    </Badge>
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa HTX/QTD "{deletingUser?.OrganizationName || deletingUser?.Username}"?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingUser) {
                                    handleDelete(deletingUser.Id);
                                    setIsDeleteConfirmOpen(false);
                                    setDeletingUser(null);
                                }
                            }}
                        >
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Multiple Delete Confirmation Dialog */}
            <Dialog open={isMultiDeleteConfirmOpen} onOpenChange={setIsMultiDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa nhiều</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa {selected.length} HTX/QTD đã chọn?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsMultiDeleteConfirmOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                handleDeleteMultiple();
                                setIsMultiDeleteConfirmOpen(false);
                            }}
                        >
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete All Confirmation Dialog */}
            <Dialog open={deletingAllConfirm} onOpenChange={setDeletingAllConfirm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa tất cả</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa tất cả {users.length} HTX/QTD?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingAllConfirm(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAll}
                        >
                            Xóa tất cả
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Nhập dữ liệu từ Excel</DialogTitle>
                        <DialogDescription>
                            Vui lòng chọn file Excel để nhập dữ liệu.
                            Bạn có thể tải mẫu nhập liệu để đảm bảo định dạng chính xác.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={downloadTemplate}
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Tải mẫu nhập liệu
                            </Button>
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <label htmlFor="excelFile" className="text-sm font-medium">
                                Chọn file Excel
                            </label>
                            <Input
                                id="excelFile"
                                type="file"
                                accept=".xlsx,.xls"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>

                        {importFile && (
                            <div className="text-sm">
                                <p className="font-medium">Đã chọn: {importFile.name}</p>
                                <p>Số bản ghi: {importData.length}</p>

                                {Object.keys(importErrors).length > 0 && (
                                    <div className="mt-2 p-2 border border-red-500 rounded bg-red-50">
                                        <p className="text-red-600 font-medium">
                                            Dữ liệu có lỗi ở {Object.keys(importErrors).length} bản ghi:
                                        </p>
                                        <ul className="list-disc pl-5 text-xs text-red-600 mt-1 max-h-40 overflow-y-auto">
                                            {Object.entries(importErrors).map(([rowIndex, errors]) => (
                                                <li key={rowIndex}>
                                                    Dòng {Number(rowIndex) + 2}: {" "}
                                                    {Object.entries(errors).map(([field, error]) => (
                                                        <span key={field}>
                                                            {field} - {error}{field !== Object.keys(errors).slice(-1)[0] ? '; ' : ''}
                                                        </span>
                                                    ))}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={
                                !importFile ||
                                importData.length === 0 ||
                                Object.keys(importErrors).length > 0 ||
                                isImporting
                            }
                        >
                            {isImporting ? "Đang xử lý..." : "Nhập dữ liệu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}