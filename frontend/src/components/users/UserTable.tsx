'use client';

import { useState, useEffect, useCallback } from 'react';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { UserForm } from './UserForm';
import { DeleteDialog } from './DeleteDialog';
import { ExportButton } from './ExportButton';
import { userService, provinceService, wardService } from '@/lib/api';
import { User, UserResponse, Province, Ward } from '@/types/user';
import { ArrowUpDown, ChevronDown, Filter } from 'lucide-react';
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
                    aria-label="Select all"
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
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setEditingUser(row.original);
                            setIsEditOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setSelectedRows([row.original.Id]);
                            setIsDeleteOpen(true);
                        }}
                    >
                        Delete
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
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.Status ? "default" : "destructive"}>
                    {row.original.Status ? "Active" : "Inactive"}
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
                    Username
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
                    Role
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'Type',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'OrganizationName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Organization Name
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
                    Manager Name
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
                    Position
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
                    Member Count
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
                    Established Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = row.original.EstablishedDate;
                return date ? new Date(date).toLocaleDateString() : '';
            }
        },
        {
            accessorKey: 'IsMember',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Is Member
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                return row.original.IsMember ? 'Yes' : 'No';
            }
        },
        {
            accessorKey: 'Province.Name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Province
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
                    Ward
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
                    Address
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
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                        {selectAllPages ? 'Deselect All Pages' : 'Select All Pages'}
                    </Button>
                    <ExportButton selectedIds={selectedRows} />
                    <Button onClick={() => setIsAddOpen(true)}>Add User</Button>
                    <Button
                        variant="destructive"
                        disabled={selectedRows.length === 0}
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        Delete Selected
                    </Button>
                </div>
            </div>
            
            {showFilters && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Role</label>
                                <Select
                                    value={roleFilter || "all"}
                                    onValueChange={setRoleFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="LMHTX">LMHTX</SelectItem>
                                        <SelectItem value="QTD">QTD</SelectItem>
                                        <SelectItem value="HTX">HTX</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="UBKT">UBKT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select
                                    value={typeFilter || "all"}
                                    onValueChange={setTypeFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="PNN">PNN</SelectItem>
                                        <SelectItem value="NN">NN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={statusFilter || "all"}
                                    onValueChange={setStatusFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Province</label>
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
                                        <SelectValue placeholder="All Provinces" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Provinces</SelectItem>
                                        {provinces.map(province => (
                                            <SelectItem key={province.Id} value={province.Id.toString()}>
                                                {province.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Ward</label>
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
                                        <SelectValue placeholder={provinceFilter ? "All Wards" : "Select Province First"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Wards</SelectItem>
                                        {wards.map(ward => (
                                            <SelectItem key={ward.Id} value={ward.Id.toString()}>
                                                {ward.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Is Member</label>
                                <Select
                                    value={isMemberFilter || "all"}
                                    onValueChange={setIsMemberFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={resetFilters}>
                                Reset Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <div className="text-sm">
                {selectedCount} of {total} row(s) selected
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
                                        No results.
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
                onOpenChange={setIsEditOpen}
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