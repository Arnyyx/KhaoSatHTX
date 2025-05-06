"use client";

import { useState } from "react";
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
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";

// Dữ liệu giả (sẽ thay bằng API sau)
const surveys = [
    {
        id: 1,
        title: "Khảo sát chất lượng HTX 2025",
    },
    {
        id: 2,
        title: "Khảo sát nhu cầu thị trường",
    },
];

const questions = [
    {
        id: 1,
        surveyId: 1,
        questionContent: "Bạn có hài lòng với chất lượng dịch vụ của HTX?",
    },
    {
        id: 2,
        surveyId: 1,
        questionContent: "Góp ý để cải thiện dịch vụ của HTX?",
    },
    {
        id: 3,
        surveyId: 2,
        questionContent: "Sản phẩm nông nghiệp nào bạn quan tâm nhất?",
    },
];

export default function QuestionManagementPage() {
    // State cho dialog thêm/sửa
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        surveyId: "",
        questionContent: "",
    });
    const [isEdit, setIsEdit] = useState(false);

    // State cho dialog xác nhận xóa
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Xử lý form
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            console.log("Cập nhật câu hỏi", formData);
        } else {
            console.log("Thêm câu hỏi mới", formData);
        }
        setDialogOpen(false);
        setFormData({ id: 0, surveyId: "", questionContent: "" });
        setIsEdit(false);
    };

    // Xử lý chỉnh sửa
    const handleEdit = (question: typeof questions[0]) => {
        setFormData({
            id: question.id,
            surveyId: question.surveyId.toString(),
            questionContent: question.questionContent,
        });
        setIsEdit(true);
        setDialogOpen(true);
    };

    // Xử lý xóa
    const handleDelete = () => {
        if (deleteId !== null) {
            console.log(`Xóa câu hỏi ID: ${deleteId}`);
            setDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Card className="mx-auto w-full">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Quản lý câu hỏi</h1>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setIsEdit(false)}>Thêm câu hỏi</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{isEdit ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="surveyId">Khảo sát</Label>
                                        <Select
                                            name="surveyId"
                                            value={formData.surveyId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, surveyId: value }))}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn khảo sát" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {surveys.map((survey) => (
                                                    <SelectItem key={survey.id} value={survey.id.toString()}>
                                                        {survey.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="questionContent">Nội dung câu hỏi</Label>
                                        <Textarea
                                            id="questionContent"
                                            name="questionContent"
                                            value={formData.questionContent}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nhập nội dung câu hỏi"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setDialogOpen(false);
                                                setIsEdit(false);
                                                setFormData({ id: 0, surveyId: "", questionContent: "" });
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                        <Button type="submit">{isEdit ? "Cập nhật" : "Thêm mới"}</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                    <TableHead className="w-[50px]">ID</TableHead>
                                    <TableHead className="w-[200px]">Khảo sát</TableHead>
                                    <TableHead className="w-[400px]">Nội dung câu hỏi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.map((question) => (
                                    <TableRow key={question.id}>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(question)}
                                                >
                                                    <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDeleteId(question.id);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{question.id}</TableCell>
                                        <TableCell>
                                            {surveys.find((s) => s.id === question.surveyId)?.title || "N/A"}
                                        </TableCell>
                                        <TableCell>{question.questionContent}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Dialog xác nhận xóa */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Xác nhận xóa</DialogTitle>
                                <DialogDescription>
                                    Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteDialogOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Xóa
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </main>
    );
}