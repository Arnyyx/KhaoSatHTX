"use client";

import { useState, useEffect } from "react";
import { RuleTableDialog } from "@/components/SurveyAccessRule/RuleTableDialog"
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
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Survey {
    Id: number;
    Title: string;
    Description: string;
    StartTime: string;
    EndTime: string;
    Status: boolean;
}
interface SurveyAccessRule {
    Id: number;
    SurveyId: number;
    Role: string;
    Type: string;
}
export function SurveyTable() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [accessRule, setAccessRule] = useState<SurveyAccessRule[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [sort, setSort] = useState({ column: "Title", direction: "asc" });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
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
                setIsEditOpen(false); // Close edit dialog
                setEditingSurvey(null); // Clear editing state
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

    const sortedSurveys = [...surveys].sort((a, b) => {
        const factor = sort.direction === "asc" ? 1 : -1;
        return a[sort.column as keyof Survey] > b[sort.column as keyof Survey]
            ? factor
            : -factor;
    });

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <Input
                    placeholder="Tìm kiếm khảo sát..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
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
                            Xoá đã chọn ({selected.length})
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
                                checked={selected.length === surveys.length}
                                onChange={() =>
                                    setSelected(
                                        selected.length === surveys.length
                                            ? []
                                            : surveys.map((s) => s.Id)
                                    )
                                }
                            />
                        </TableHead>
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
                        <TableHead>Phân quyền</TableHead>
                        <TableHead>Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedSurveys.map((survey) => (
                        <Dialog key={survey.Id}>
                            <DialogTrigger asChild>
                                <TableRow className="cursor-pointer hover:bg-gray-50">
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(survey.Id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSelect(survey.Id);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {survey.Title}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {survey.Description}
                                    </TableCell>
                                    <TableCell>
                                        {survey.StartTime
                                            ? new Date(survey.StartTime).toLocaleString()
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {survey.EndTime
                                            ? new Date(survey.EndTime).toLocaleString()
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={survey.Status ? "default" : "destructive"}
                                            className={survey.Status ? "bg-green-500" : "bg-red-500"}
                                        >
                                            {survey.Status ? "Hoạt động" : "Không hoạt động"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <RuleTableDialog SurveyId={survey.Id}></RuleTableDialog>
                                    </TableCell>
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
                                                    <DialogTitle>Edit Survey</DialogTitle>
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
                                            Xoá
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Câu hỏi của khảo sát: {survey.Title}</DialogTitle>
                                </DialogHeader>
                                <QuestionsTable surveyId={survey.Id} />
                            </DialogContent>
                        </Dialog>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-between mt-4">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Trang trước
                </Button>
                <span>
                    Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Trang tiếp
                </Button>
            </div>
        </div>
    );
}