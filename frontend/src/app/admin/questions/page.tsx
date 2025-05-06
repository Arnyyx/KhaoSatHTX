"use client";

import { useState, useEffect } from "react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { API } from "@/lib/api";
import { toast } from "sonner";

interface Question {
    id: number;
    surveyId: number;
    content: string;
    type: string;
}

interface Survey {
    Id: number;
    Title: string;
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [questionFormData, setQuestionFormData] = useState({
        surveyId: "",
        content: "",
        type: "Multiple Choice",
    });
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
    const [questionLoading, setQuestionLoading] = useState(false);
    const [questionError, setQuestionError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            setQuestionLoading(true);
            try {
                const res = await fetch(API.questions);
                if (!res.ok) throw new Error("Không thể lấy danh sách câu hỏi");
                const data = await res.json();
                setQuestions(data);
            } catch (error: any) {
                setQuestionError(error.message);
                toast.error("Lỗi khi lấy danh sách câu hỏi", {
                    description: error.message,
                });
            } finally {
                setQuestionLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const res = await fetch(API.surveys);
                if (!res.ok) throw new Error("Không thể lấy danh sách khảo sát");
                const data = await res.json();
                setSurveys(data);
            } catch (error: any) {
                toast.error("Lỗi khi lấy danh sách khảo sát", {
                    description: error.message,
                });
            }
        };
        fetchSurveys();
    }, []);

    const handleQuestionChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
    ) => {
        const { name, value } = "target" in e ? e.target : e;
        setQuestionFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingQuestionId ? "PUT" : "POST";
            const url = editingQuestionId ? `${API.questions}/${editingQuestionId}` : API.questions;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(questionFormData),
            });
            if (!res.ok)
                throw new Error(
                    editingQuestionId ? "Không thể cập nhật câu hỏi" : "Không thể thêm câu hỏi"
                );
            const data = await res.json();
            if (editingQuestionId) {
                setQuestions(questions.map((q) => (q.id === editingQuestionId ? data : q)));
                toast.success("Cập nhật câu hỏi thành công");
            } else {
                setQuestions([...questions, data]);
                toast.success("Thêm câu hỏi thành công");
            }
            setQuestionDialogOpen(false);
            setQuestionFormData({
                surveyId: "",
                content: "",
                type: "Multiple Choice",
            });
            setEditingQuestionId(null);
        } catch (error: any) {
            toast.error("Lỗi khi lưu câu hỏi", {
                description: error.message,
            });
        }
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestionId(question.id);
        setQuestionFormData({
            surveyId: question.surveyId.toString(),
            content: question.content,
            type: question.type,
        });
        setQuestionDialogOpen(true);
    };

    const handleDeleteQuestion = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
        try {
            const res = await fetch(`${API.questions}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Không thể xóa câu hỏi");
            setQuestions(questions.filter((q) => q.id !== id));
            toast.success("Xóa câu hỏi thành công");
        } catch (error: any) {
            toast.error("Lỗi khi xóa câu hỏi", {
                description: error.message,
            });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý câu hỏi</h1>
                <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Thêm câu hỏi</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingQuestionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleQuestionSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="surveyId">Khảo sát</Label>
                                <Select
                                    name="surveyId"
                                    value={questionFormData.surveyId}
                                    onValueChange={(value) =>
                                        handleQuestionChange({ name: "surveyId", value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khảo sát" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {surveys.map((survey) => (
                                            <SelectItem
                                                key={survey.Id}
                                                value={survey.Id.toString()}
                                            >
                                                {survey.Title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    value={questionFormData.content}
                                    onChange={handleQuestionChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Loại câu hỏi</Label>
                                <Select
                                    name="type"
                                    value={questionFormData.type}
                                    onValueChange={(value) =>
                                        handleQuestionChange({ name: "type", value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại câu hỏi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Multiple Choice">
                                            Trắc nghiệm
                                        </SelectItem>
                                        <SelectItem value="Text">Tự luận</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setQuestionDialogOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit">
                                    {editingQuestionId ? "Cập nhật" : "Thêm"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Khảo sát</TableHead>
                                <TableHead>Nội dung</TableHead>
                                <TableHead>Loại câu hỏi</TableHead>
                                <TableHead>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.map((question) => (
                                <TableRow key={question.id}>
                                    <TableCell>
                                        {surveys.find((s) => s.Id === question.surveyId)?.Title ||
                                            question.surveyId}
                                    </TableCell>
                                    <TableCell>{question.content}</TableCell>
                                    <TableCell>{question.type}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditQuestion(question)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 