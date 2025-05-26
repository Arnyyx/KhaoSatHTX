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
import { surveyService } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SurveyForm } from "./SurveyForm";
import { QuestionsTable } from "../questions/QuestionsTable";
import { ArrowUpDown, Filter, Eye, EyeOff, Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterDatePicker } from "@/components/ui/filter-date-picker";

interface Survey {
    Id: number;
    Title: string;
    Description: string;
    StartTime: string;
    EndTime: string;
    Status: boolean;
}

interface ColumnVisibility {
    Title: boolean;
    Description: boolean;
    StartTime: boolean;
    EndTime: boolean;
    Status: boolean;
}

interface FilterState {
    Title: string;
    Description: string;
    StartDate: Date | null;
    EndDate: Date | null;
    Status: string | null;
}

export function SurveyTable() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [sort, setSort] = useState({ column: "Title", direction: "asc" });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
        Title: true,
        Description: true,
        StartTime: true,
        EndTime: true,
        Status: true,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        Title: "",
        Description: "",
        StartDate: null,
        EndDate: null,
        Status: null,
    });

    const fetchSurveys = async (searchQuery: string = "") => {
        try {
            const data = await surveyService.getSurveysByPage(page, 10, searchQuery);
            setSurveys(data.rows);
            setPagination({
                currentPage: page,
                totalPages: Math.ceil(data.count / 10),
                totalItems: data.count,
            });
        } catch (error: any) {
            toast.error("Lỗi khi lấy danh sách khảo sát", {
                description: error.message,
            });
        }
    };

    useEffect(() => {
        fetchSurveys(search);
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
            await surveyService.createSurvey(data);
            setIsCreateOpen(false);
            fetchSurveys(search);
            toast.success("Tạo khảo sát thành công");
        } catch (error: any) {
            toast.error("Lỗi khi tạo khảo sát", {
                description: error.message,
            });
        }
    };

    const handleUpdate = async (data: any) => {
        if (editingSurvey) {
            try {
                await surveyService.updateSurvey(editingSurvey.Id, data);
                setIsEditOpen(false);
                setEditingSurvey(null);
                fetchSurveys(search);
                toast.success("Cập nhật khảo sát thành công");
            } catch (error: any) {
                toast.error("Lỗi khi cập nhật khảo sát", {
                    description: error.message,
                });
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await surveyService.deleteSurvey(id);
            fetchSurveys(search);
            toast.success("Xóa khảo sát thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa khảo sát", {
                description: error.message,
            });
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            await surveyService.deleteMultipleSurveys(selected);
            setSelected([]);
            fetchSurveys(search);
            toast.success("Xóa nhiều khảo sát thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa nhiều khảo sát", {
                description: error.message,
            });
        }
    };

    const applyFilters = (survey: Survey) => {
        if (
            filters.Title &&
            !survey.Title.toLowerCase().includes(filters.Title.toLowerCase())
        ) {
            return false;
        }
        if (
            filters.Description &&
            !survey.Description.toLowerCase().includes(filters.Description.toLowerCase())
        ) {
            return false;
        }
        if (filters.StartDate) {
            const surveyDate = new Date(survey.StartTime);
            const filterDate = new Date(filters.StartDate);
            if (
                surveyDate.getFullYear() !== filterDate.getFullYear() ||
                surveyDate.getMonth() !== filterDate.getMonth() ||
                surveyDate.getDate() !== filterDate.getDate()
            ) {
                return false;
            }
        }
        if (filters.EndDate) {
            const surveyDate = new Date(survey.EndTime);
            const filterDate = new Date(filters.EndDate);
            if (
                surveyDate.getFullYear() !== filterDate.getFullYear() ||
                surveyDate.getMonth() !== filterDate.getMonth() ||
                surveyDate.getDate() !== filterDate.getDate()
            ) {
                return false;
            }
        }
        if (filters.Status !== null) {
            if (
                (filters.Status === "active" && !survey.Status) ||
                (filters.Status === "inactive" && survey.Status)
            ) {
                return false;
            }
        }
        return true;
    };

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const resetFilters = () => {
        setFilters({
            Title: "",
            Description: "",
            StartDate: null,
            EndDate: null,
            Status: null,
        });
    };

    const filteredSurveys = [...surveys].filter(applyFilters);

    const sortedSurveys = [...filteredSurveys].sort((a, b) => {
        const factor = sort.direction === "asc" ? 1 : -1;
        return a[sort.column as keyof Survey] > b[sort.column as keyof Survey]
            ? factor
            : -factor;
    });

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "-";
        try {
            const date = parseISO(dateString);
            return format(date, "HH:mm dd/MM/yyyy", { locale: vi });
        } catch (error) {
            return "-";
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Tìm kiếm khảo sát..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center"
                    >
                        {showFilters ? (
                            <>
                                <X className="h-4 w-4 mr-2" />
                                Ẩn bộ lọc
                            </>
                        ) : (
                            <>
                                <Filter className="h-4 w-4 mr-2" />
                                Hiện bộ lọc
                            </>
                        )}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center">
                                {Object.values(columnVisibility).every((v) => v) ? (
                                    <Eye className="h-4 w-4 mr-2" />
                                ) : (
                                    <EyeOff className="h-4 w-4 mr-2" />
                                )}
                                Hiển thị cột
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Hiển thị/Ẩn cột</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.Title}
                                onCheckedChange={(checked) =>
                                    setColumnVisibility({ ...columnVisibility, Title: checked })
                                }
                            >
                                Tiêu đề
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.Description}
                                onCheckedChange={(checked) =>
                                    setColumnVisibility({ ...columnVisibility, Description: checked })
                                }
                            >
                                Mô tả
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.StartTime}
                                onCheckedChange={(checked) =>
                                    setColumnVisibility({ ...columnVisibility, StartTime: checked })
                                }
                            >
                                Thời gian bắt đầu
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.EndTime}
                                onCheckedChange={(checked) =>
                                    setColumnVisibility({ ...columnVisibility, EndTime: checked })
                                }
                            >
                                Thời gian kết thúc
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.Status}
                                onCheckedChange={(checked) =>
                                    setColumnVisibility({ ...columnVisibility, Status: checked })
                                }
                            >
                                Trạng thái
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="space-x-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tạo khảo sát</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo khảo sát mới</DialogTitle>
                            </DialogHeader>
                            <SurveyForm
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

            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-md mb-4 flex gap-4 flex-wrap">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                        <Input
                            placeholder="Lọc theo tiêu đề"
                            value={filters.Title}
                            onChange={(e) => handleFilterChange("Title", e.target.value)}
                            className="w-64"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <Input
                            placeholder="Lọc theo mô tả"
                            value={filters.Description}
                            onChange={(e) => handleFilterChange("Description", e.target.value)}
                            className="w-64"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                        <FilterDatePicker
                            date={filters.StartDate || undefined}
                            onSelect={(date: Date) => handleFilterChange("StartDate", date)}
                            placeholder="Chọn ngày bắt đầu"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                        <FilterDatePicker
                            date={filters.EndDate || undefined}
                            onSelect={(date: Date) => handleFilterChange("EndDate", date)}
                            placeholder="Chọn ngày kết thúc"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {filters.Status === "active"
                                        ? "Hoạt động"
                                        : filters.Status === "inactive"
                                            ? "Không hoạt động"
                                            : "Tất cả trạng thái"}
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleFilterChange("Status", null)}>
                                    Tất cả
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleFilterChange("Status", "active")}
                                >
                                    Hoạt động
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleFilterChange("Status", "inactive")}
                                >
                                    Không hoạt động
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="flex items-center"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={
                                    selected.length === filteredSurveys.length &&
                                    filteredSurveys.length > 0
                                }
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelected(filteredSurveys.map((s) => s.Id));
                                    } else {
                                        setSelected([]);
                                    }
                                }}
                                aria-label="Chọn tất cả"
                            />
                        </TableHead>
                        {columnVisibility.Title && (
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("Title")}
                                    className="flex items-center space-x-1"
                                >
                                    <span>Tiêu đề</span>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                        )}
                        {columnVisibility.Description && (
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("Description")}
                                    className="flex items-center space-x-1"
                                >
                                    <span>Mô tả</span>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                        )}
                        {columnVisibility.StartTime && (
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("StartTime")}
                                    className="flex items-center space-x-1"
                                >
                                    <span>Thời gian bắt đầu</span>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                        )}
                        {columnVisibility.EndTime && (
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("EndTime")}
                                    className="flex items-center space-x-1"
                                >
                                    <span>Thời gian kết thúc</span>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                        )}
                        {columnVisibility.Status && (
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
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedSurveys.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                                Không tìm thấy khảo sát nào
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedSurveys.map((survey) => (
                            <Dialog key={survey.Id}>
                                <DialogTrigger asChild>
                                    <TableRow className="cursor-pointer hover:bg-gray-50">
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selected.includes(survey.Id)}
                                                onCheckedChange={() => handleSelect(survey.Id)}
                                                aria-label={`Chọn khảo sát ${survey.Title}`}
                                            />
                                        </TableCell>
                                        {columnVisibility.Title && (
                                            <TableCell className="max-w-[200px] truncate">
                                                {survey.Title}
                                            </TableCell>
                                        )}
                                        {columnVisibility.Description && (
                                            <TableCell className="max-w-[200px] truncate">
                                                {survey.Description}
                                            </TableCell>
                                        )}
                                        {columnVisibility.StartTime && (
                                            <TableCell>{formatDateTime(survey.StartTime)}</TableCell>
                                        )}
                                        {columnVisibility.EndTime && (
                                            <TableCell>{formatDateTime(survey.EndTime)}</TableCell>
                                        )}
                                        {columnVisibility.Status && (
                                            <TableCell>
                                                <Badge
                                                    variant={survey.Status ? "default" : "destructive"}
                                                    className={survey.Status ? "bg-green-500" : "bg-red-500"}
                                                >
                                                    {survey.Status ? "Hoạt động" : "Không hoạt động"}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setEditingSurvey(survey)}
                                                    >
                                                        Sửa
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Sửa khảo sát</DialogTitle>
                                                    </DialogHeader>
                                                    <SurveyForm
                                                        initialData={editingSurvey || undefined}
                                                        onSubmit={handleUpdate}
                                                        onCancel={() => {
                                                            setIsEditOpen(false);
                                                            setEditingSurvey(null);
                                                        }}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(survey.Id)}
                                                className="ml-2"
                                            >
                                                Xóa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                    <DialogHeader>
                                        <DialogTitle>Câu hỏi cho {survey.Title}</DialogTitle>
                                    </DialogHeader>
                                    <QuestionsTable surveyId={survey.Id} />
                                </DialogContent>
                            </Dialog>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
                <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Trang trước
                </Button>
                <span>
                    Trang {pagination.currentPage || 1} / {pagination.totalPages || 1}
                </span>
                <Button
                    disabled={!pagination.totalPages || page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Trang sau
                </Button>
            </div>
        </div>
    );
}