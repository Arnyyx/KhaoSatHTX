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
import { QuestionForm } from "./QuestionForm";
import { toast } from "sonner";
import { Search, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Question {
    Id: number;
    SurveyId: number;
    QuestionContent: string;
}

interface QuestionsTableProps {
    surveyId: number;
}

export function QuestionsTable({ surveyId }: QuestionsTableProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const data = await surveyService.getQuestions(surveyId, page);
            setQuestions(data.data);
            setPagination(data.pagination);
        } catch (error) {
            toast.error("Failed to fetch questions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [page, surveyId]);

    const handleCreate = async (data: any) => {
        try {
            await surveyService.createQuestion({ ...data, SurveyId: surveyId });
            toast.success("Question created successfully");
            setIsCreateOpen(false);
            fetchQuestions();
        } catch (error) {
            toast.error("Failed to create question");
        }
    };

    const handleUpdate = async (data: any) => {
        if (editingQuestion) {
            try {
                await surveyService.updateQuestion(editingQuestion.Id, data);
                toast.success("Question updated successfully");
                setIsEditOpen(false);
                setEditingQuestion(null);
                fetchQuestions();
            } catch (error) {
                toast.error("Failed to update question");
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await surveyService.deleteQuestion(id);
            toast.success("Question deleted successfully");
            fetchQuestions();
        } catch (error) {
            toast.error("Failed to delete question");
        }
    };

    const filteredQuestions = questions.filter((question) =>
        question.QuestionContent.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Create Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Question</DialogTitle>
                        </DialogHeader>
                        <QuestionForm
                            onSubmit={handleCreate}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Question Content</TableHead>
                                <TableHead className="w-[200px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions.map((question) => (
                                <TableRow key={question.Id}>
                                    <TableCell>{question.Id}</TableCell>
                                    <TableCell>{question.QuestionContent}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => {
                                                        setEditingQuestion(question);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Question</DialogTitle>
                                                </DialogHeader>
                                                <QuestionForm
                                                    initialData={editingQuestion || undefined}
                                                    onSubmit={handleUpdate}
                                                    onCancel={() => {
                                                        setIsEditOpen(false);
                                                        setEditingQuestion(null);
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(question.Id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredQuestions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No questions found
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-6">
                        <Button
                            variant="outline"
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            disabled={page === pagination.totalPages || isLoading}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}