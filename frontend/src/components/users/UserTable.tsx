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
import { userService } from '@/lib/api';
import { User, UserResponse } from '@/types/user';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

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

    // Fetch users
    const fetchUsers = useCallback(async () => {
        const sortColumn = sorting[0]?.id || 'Username';
        const sortDirection = sorting[0]?.desc ? 'DESC' : 'ASC';
        const response: UserResponse = await userService.getUsers(page, limit, search, sortColumn, sortDirection);
        setData(response.items);
        setTotal(response.total);
    }, [page, limit, search, sorting]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle "Select All Pages"
    const handleSelectAllPages = async () => {
        if (selectAllPages) {
            setSelectedRows([]);
            setSelectAllPages(false);
        } else {
            try {
                // Fetch all user IDs
                const response: UserResponse = await userService.getUsers(1, total, search, sorting[0]?.id || 'Username', sorting[0]?.desc ? 'DESC' : 'ASC');
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
                            console.log('User to edit:', row.original);
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
            header: 'Email',
        },
        {
            accessorKey: 'Role',
            header: 'Role',
        },
        {
            accessorKey: 'Province.Name',
            header: 'Province',
        },
        {
            accessorKey: 'Ward.Name',
            header: 'Ward',
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
            <div className="text-sm">
                {selectedCount} of {total} row(s) selected
            </div>
            <div className="rounded-md border">
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