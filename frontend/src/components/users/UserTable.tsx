'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    ColumnFiltersState,
    getFilteredRowModel,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { UserForm } from './UserForm';
import { DeleteDialog } from './DeleteDialog';
import { ExportButton } from './ExportButton';
import { userService, provinceService, wardService } from '@/lib/api';
import { User, UserResponse, Province, Ward } from '@/types/user';
import { ArrowUpDown, ChevronDown, Download, FileSpreadsheet, Filter, Upload, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { excelUtils } from '@/lib/excel-utils';
import * as XLSX from 'xlsx';

export function UserTable() {
    const [data, setData] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'Username', desc: false }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [selectAllPages, setSelectAllPages] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>();
    const [columnVisibility, setColumnVisibility] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [provinceFilter, setProvinceFilter] = useState<number | undefined>(undefined);
    const [wardFilter, setWardFilter] = useState<number | undefined>(undefined);
    const [isMemberFilter, setIsMemberFilter] = useState<string | undefined>(undefined);

    // Province and Ward data for filters
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    
    // Excel import state
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importData, setImportData] = useState<any[]>([]);
    const [importErrors, setImportErrors] = useState<Record<number, Record<string, string>>>({});
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEditUser = (user: User) => {
        setEditingUser(user); // Cập nhật editingUser trước
        setIsEditOpen(true);  // Mở form sau khi cập nhật
    };

    const handleEditFormClose = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            setEditingUser(undefined); // Đặt lại editingUser khi đóng form
        }
    };

    // Fetch provinces for filter
    useEffect(() => {
        provinceService.getProvinces().then(response => {
            setProvinces(response.items);
        }).catch(error => {
            console.error("Error fetching provinces:", error);
        });
    }, []);

    // Fetch wards when province changes
    useEffect(() => {
        if (provinceFilter) {
            wardService.getWardsByProvinceId(provinceFilter).then(response => {
                setWards(response.items);
            }).catch(error => {
                console.error("Error fetching wards:", error);
            });
        } else {
            setWards([]);
            setWardFilter(undefined);
        }
    }, [provinceFilter]);

    // Fetch users with filters
    const fetchUsers = useCallback(async () => {
        try {
            const sortColumn = sorting[0]?.id || 'Username';
            const sortDirection = sorting[0]?.desc ? 'DESC' : 'ASC';

            // Construct filter object
            const filters: Record<string, any> = {};
            if (roleFilter && roleFilter !== "all") filters.Role = roleFilter;
            if (typeFilter && typeFilter !== "all") filters.Type = typeFilter;
            if (statusFilter && statusFilter !== "all") filters.Status = statusFilter === 'true';
            if (provinceFilter) filters.ProvinceId = provinceFilter;
            if (wardFilter) filters.WardId = wardFilter;
            if (isMemberFilter && isMemberFilter !== "all") filters.IsMember = isMemberFilter === 'true';

            const response: UserResponse = await userService.getUsers(
                page,
                limit,
                search,
                sortColumn,
                sortDirection,
                filters
            );
            setData(response.items);
            setTotal(response.total);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error(error);
        }
    }, [page, limit, search, sorting, roleFilter, typeFilter, statusFilter, provinceFilter, wardFilter, isMemberFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset filters
    const resetFilters = () => {
        setRoleFilter(undefined);
        setTypeFilter(undefined);
        setStatusFilter(undefined);
        setProvinceFilter(undefined);
        setWardFilter(undefined);
        setIsMemberFilter(undefined);
    };

    // Function to export data to Excel
    const exportToExcel = () => {
        try {
            const filteredUsers = data.filter(user => {
                if (roleFilter && user.Role !== roleFilter) return false;
                if (typeFilter && user.Type !== typeFilter) return false;
                if (statusFilter && (user.Status?.toString() !== statusFilter)) return false;
                if (provinceFilter && user.ProvinceId !== provinceFilter) return false;
                if (wardFilter && user.WardId !== wardFilter) return false;
                if (isMemberFilter && (user.IsMember?.toString() !== isMemberFilter)) return false;
                return true;
            });

            excelUtils.exportUsersToExcel(filteredUsers, provinces, wards);

            toast.success("Xuất dữ liệu thành công", {
                description: `Đã xuất ${filteredUsers.length} bản ghi`
            });
        } catch (error: any) {
            console.error("Lỗi khi xuất Excel:", error);
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
                console.error("Lỗi khi đọc file Excel:", error);
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
        // This should be implemented with proper validation
        const errors = excelUtils.validateUserImportData(data);
        setImportErrors(errors);
    };

    // Function to handle import
    const handleImport = async () => {
        if (!importFile) {
            toast.error("Vui lòng chọn file Excel");
            return;
        }

        if (Object.keys(importErrors).length > 0) {
            toast.error("Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        if (importData.length === 0) {
            toast.error("Không có dữ liệu để nhập");
            return;
        }

        try {
            setIsImporting(true);

            try {
                // Call API to import data, sending the original file
                const response = await userService.importUsers(importFile);

                toast.success("Nhập dữ liệu thành công", {
                    description: "File đã được tải lên và đang được xử lý"
                });

                // Reset import state
                setImportFile(null);
                setImportData([]);
                setImportErrors({});
                setIsImportDialogOpen(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                // Refresh the data
                fetchUsers();
            } catch (error: any) {
                console.error("API Error Response:", error.response?.data);

                // Show detailed error message if available
                const errorDetail = error.response?.data?.message || error.response?.data?.error || error.message;
                toast.error("Lỗi khi nhập dữ liệu", {
                    description: `${errorDetail}. Vui lòng kiểm tra dữ liệu và thử lại.`
                });
            }
        } catch (error: any) {
            console.error("Lỗi khi xử lý dữ liệu Excel:", error);
            toast.error("Lỗi khi xử lý dữ liệu Excel", {
                description: error.message
            });
        } finally {
            setIsImporting(false);
        }
    };

    // Function to download template
    const downloadTemplate = () => {
        try {
            excelUtils.downloadUserTemplate();
            toast.success("Tải mẫu nhập liệu thành công");
        } catch (error: any) {
            console.error("Lỗi khi tải mẫu nhập liệu:", error);
            toast.error("Lỗi khi tải mẫu nhập liệu", {
                description: error.message,
            });
        }
    };

    // Handle "Select All Pages"
    const handleSelectAllPages = async () => {
        if (selectAllPages) {
            setSelectedRows([]);
            setSelectAllPages(false);
        } else {
            try {
                // Build filter object
                const filters: Record<string, any> = {};
                if (roleFilter && roleFilter !== "all") filters.Role = roleFilter;
                if (typeFilter && typeFilter !== "all") filters.Type = typeFilter;
                if (statusFilter && statusFilter !== "all") filters.Status = statusFilter === 'true';
                if (provinceFilter) filters.ProvinceId = provinceFilter;
                if (wardFilter) filters.WardId = wardFilter;
                if (isMemberFilter && isMemberFilter !== "all") filters.IsMember = isMemberFilter === 'true';

                // Fetch all user IDs
                const response: UserResponse = await userService.getUsers(
                    1,
                    total,
                    search,
                    sorting[0]?.id || 'Username',
                    sorting[0]?.desc ? 'DESC' : 'ASC',
                    filters
                );

                const allIds = response.items.map((user) => user.Id);
                setSelectedRows(allIds);
                setSelectAllPages(true);
            } catch (error) {
                toast.error('Failed to select all users');
            }
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || selectAllPages}
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                        const currentPageIds = data.map((row) => row.Id);
                        setSelectedRows((prev) =>
                            value
                                ? [...new Set([...prev, ...currentPageIds])]
                                : prev.filter((id) => !currentPageIds.includes(id))
                        );
                        if (!value) {
                            setSelectAllPages(false);
                        }
                    }}
                    aria-label="Chọn tất cả"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.includes(row.original.Id)}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                        setSelectedRows((prev) =>
                            value
                                ? [...prev, row.original.Id]
                                : prev.filter((id) => id !== row.original.Id)
                        );
                        if (!value) {
                            setSelectAllPages(false);
                        }
                    }}
                    aria-label="Chọn dòng"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(row.original)}
                    >
                        Sửa
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setSelectedRows([row.original.Id]);
                            setIsDeleteOpen(true);
                        }}
                    >
                        Xóa
                    </Button>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'Status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Trạng thái
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.Status ? "default" : "destructive"}>
                    {row.original.Status ? "Hoạt động" : "Không hoạt động"}
                </Badge>
            ),
        },
        {
            accessorKey: 'Username',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Tên đăng nhập
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Email',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Role',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Vai trò
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const role = row.original.Role;
                return role === "HTX" ? "Hợp tác xã" : 
                       role === "QTD" ? "Quỹ tín dụng" : 
                       role === "LMHTX" ? "LMHTX" : 
                       role === "UBKT" ? "UBKT" : 
                       role === "admin" ? "Admin" : role;
            }
        },
        {
            accessorKey: 'Type',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Loại hình
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const type = row.original.Type;
                return type === "NN" ? "Nông nghiệp" : 
                       type === "PNN" ? "Phi nông nghiệp" : type;
            }
        },
        {
            accessorKey: 'OrganizationName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Tên tổ chức
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Người quản lý
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Position',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Chức vụ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'MemberCount',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Số thành viên
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'EstablishedDate',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Ngày thành lập
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = row.original.EstablishedDate;
                if (!date) return '';

                const dateObj = new Date(date);
                // Format as DD/MM/YYYY
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();

                return `${day}/${month}/${year}`;
            }
        },
        {
            accessorKey: 'IsMember',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Là thành viên
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                return row.original.IsMember ? 'Có' : 'Không';
            }
        },
        {
            accessorKey: 'Province.Name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Tỉnh/Thành phố
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Ward.Name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Phường/Xã
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Address',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Địa chỉ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection: Object.fromEntries(
                data
                    .map((row, index) => [index, selectedRows.includes(row.Id)])
                    .filter(([, selected]) => selected)
            ),
        },
        onRowSelectionChange: (updater) => {
            const newRowSelection = typeof updater === 'function' ? updater(table.getState().rowSelection) : updater;
            const selectedIds = data
                .filter((_, index) => newRowSelection[index])
                .map((row) => row.Id);
            setSelectedRows((prev) => [
                ...new Set([
                    ...prev.filter((id) => !data.map((row) => row.Id).includes(id)),
                    ...selectedIds,
                ]),
            ]);
        },
    });

    const selectedCount = selectAllPages ? total : selectedRows.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center"
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
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                Cột
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant={selectAllPages ? 'default' : 'outline'}
                        onClick={handleSelectAllPages}
                    >
                        {selectAllPages ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </Button>
                    
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
                    
                    <Button onClick={() => setIsAddOpen(true)}>Thêm người dùng</Button>
                    <Button
                        variant="destructive"
                        disabled={selectedRows.length === 0}
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        Xóa đã chọn ({selectedRows.length})
                    </Button>
                </div>
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Nhập dữ liệu người dùng từ Excel</DialogTitle>
                        <DialogDescription>
                            Tải lên file Excel chứa dữ liệu người dùng. Đảm bảo file đúng định dạng để tránh lỗi khi nhập.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-2">
                            <Input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                            />
                            {importFile && (
                                <div className="text-sm">
                                    <p>File đã chọn: {importFile.name}</p>
                                    <p>Kích thước: {(importFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            )}
                        </div>

                        {importData.length > 0 && (
                            <div>
                                <p className="text-sm">Số dòng dữ liệu: {importData.length}</p>
                                {Object.keys(importErrors).length > 0 && (
                                    <div className="mt-2 text-sm text-red-500">
                                        <p>Dữ liệu có lỗi:</p>
                                        <ul className="list-disc pl-5">
                                            {Object.entries(importErrors).map(([rowIndex, errors]) => (
                                                <li key={rowIndex}>
                                                    Dòng {parseInt(rowIndex) + 1}:
                                                    <ul className="list-disc pl-5">
                                                        {Object.entries(errors).map(([field, error]) => (
                                                            <li key={field}>{error}</li>
                                                        ))}
                                                    </ul>
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
                            onClick={downloadTemplate}
                            variant="outline"
                        >
                            Tải mẫu nhập liệu
                        </Button>
                        <Button 
                            onClick={handleImport} 
                            disabled={!importFile || Object.keys(importErrors).length > 0 || isImporting}
                        >
                            {isImporting ? "Đang nhập..." : "Nhập dữ liệu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {showFilters && (
                <Card className="mt-4">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Vai trò</label>
                                <Select
                                    value={roleFilter || "all"}
                                    onValueChange={setRoleFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tất cả vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                                        <SelectItem value="LMHTX">LMHTX</SelectItem>
                                        <SelectItem value="QTD">Quỹ tín dụng</SelectItem>
                                        <SelectItem value="HTX">Hợp tác xã</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="UBKT">UBKT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Loại hình</label>
                                <Select
                                    value={typeFilter || "all"}
                                    onValueChange={setTypeFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tất cả loại hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả loại hình</SelectItem>
                                        <SelectItem value="PNN">Phi nông nghiệp</SelectItem>
                                        <SelectItem value="NN">Nông nghiệp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Trạng thái</label>
                                <Select
                                    value={statusFilter || "all"}
                                    onValueChange={setStatusFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tất cả trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="true">Hoạt động</SelectItem>
                                        <SelectItem value="false">Không hoạt động</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tỉnh/Thành phố</label>
                                <Select
                                    value={provinceFilter ? provinceFilter.toString() : "all"}
                                    onValueChange={(value) => {
                                        if (value === "all") {
                                            setProvinceFilter(undefined);
                                        } else {
                                            setProvinceFilter(parseInt(value));
                                        }
                                        setWardFilter(undefined);
                                    }}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tất cả tỉnh/thành phố" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả tỉnh/thành phố</SelectItem>
                                        {provinces.map(province => (
                                            <SelectItem key={province.Id} value={province.Id.toString()}>
                                                {province.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Phường/Xã</label>
                                <Select
                                    value={wardFilter ? wardFilter.toString() : "all"}
                                    onValueChange={(value) => {
                                        if (value === "all") {
                                            setWardFilter(undefined);
                                        } else {
                                            setWardFilter(parseInt(value));
                                        }
                                    }}
                                    defaultValue="all"
                                    disabled={!provinceFilter || wards.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={provinceFilter ? "Tất cả phường/xã" : "Chọn tỉnh/thành phố trước"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phường/xã</SelectItem>
                                        {wards.map(ward => (
                                            <SelectItem key={ward.Id} value={ward.Id.toString()}>
                                                {ward.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Là thành viên</label>
                                <Select
                                    value={isMemberFilter || "all"}
                                    onValueChange={setIsMemberFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="true">Có</SelectItem>
                                        <SelectItem value="false">Không</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={resetFilters}>
                                Đặt lại bộ lọc
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="text-sm">
                {selectedCount} trên {total} dòng được chọn
            </div>
            <div className="rounded-md border overflow-auto">
                <div className="min-w-max">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Không có dữ liệu.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <DataTablePagination
                table={table}
                total={total}
                page={page}
                limit={limit}
                setPage={setPage}
                setLimit={setLimit}
            />
            <UserForm
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSuccess={fetchUsers}
            />
            <UserForm
                open={isEditOpen}
                onOpenChange={handleEditFormClose}
                user={editingUser}
                onSuccess={fetchUsers}
            />
            <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                userIds={selectedRows}
                onSuccess={() => {
                    setSelectedRows([]);
                    setSelectAllPages(false);
                    fetchUsers();
                }}
            />
        </div>
    );
}