"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QuestionFormProps {
    initialData?: {
        Id?: number;
        QuestionContent: string;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function QuestionForm({ initialData, onSubmit, onCancel }: QuestionFormProps) {
    const [formData, setFormData] = useState({
        QuestionContent: initialData?.QuestionContent || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.QuestionContent.trim()) {
            toast.error("Question content is required");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="questionContent">Question Content</Label>
                <Textarea
                    id="questionContent"
                    value={formData.QuestionContent}
                    onChange={(e) =>
                        setFormData({ ...formData, QuestionContent: e.target.value })
                    }
                    placeholder="Enter question content"
                    className="mt-1"
                    rows={4}
                />
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {initialData?.Id ? "Updating..." : "Creating..."}
                        </>
                    ) : (
                        <>{initialData?.Id ? "Update" : "Create"}</>
                    )}
                </Button>
            </div>
        </form>
    );
}