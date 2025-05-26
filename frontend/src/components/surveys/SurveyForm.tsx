"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid, addMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

interface SurveyFormProps {
    initialData?: {
        Id?: number;
        Title: string;
        Description: string;
        StartTime: string;
        EndTime: string;
        Status: boolean;
    };
    onSubmit: (data: FormData) => void;
    onCancel: () => void;
}


type FormData = z.infer<typeof FormSchema>;
// Định nghĩa schema validation với zod
const FormSchema = z.object({
    Title: z.string().min(1, "Vui lòng nhập tiêu đề khảo sát"),
    Description: z.string().min(1, "Vui lòng nhập mô tả khảo sát"),
    StartTime: z.date({ required_error: "Vui lòng chọn thời gian bắt đầu" }),
    EndTime: z.date({ required_error: "Vui lòng chọn thời gian kết thúc" }),
    Status: z.boolean(),
}).refine((data) => data.EndTime > data.StartTime, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["EndTime"],
});

export function SurveyForm({ initialData, onSubmit, onCancel }: SurveyFormProps) {
    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            Title: initialData?.Title || "",
            Description: initialData?.Description || "",
            StartTime: initialData?.StartTime
                ? isValid(parseISO(initialData.StartTime))
                    ? parseISO(initialData.StartTime)
                    : new Date()
                : new Date(),
            EndTime: initialData?.EndTime
                ? isValid(parseISO(initialData.EndTime))
                    ? parseISO(initialData.EndTime)
                    : addMinutes(new Date(), 60)
                : addMinutes(new Date(), 60),
            Status: initialData?.Status ?? true,
        },
    });

    const handleSubmit = (data: FormData) => {
        onSubmit({
            ...data,
            StartTime: format(data.StartTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
            EndTime: format(data.EndTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        });
        toast.success("Khảo sát đã được gửi");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="Title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tiêu đề</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tiêu đề khảo sát" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập mô tả khảo sát" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="StartTime"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <DatePicker
                                control={form.control}
                                name="StartTime"
                                label="Thời gian bắt đầu"
                                showTimePicker={false} // Chỉ chọn ngày
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                Thời gian hiện tại: {format(field.value, "HH:mm dd/MM/yyyy", { locale: vi })}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="EndTime"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <DatePicker
                                control={form.control}
                                name="EndTime"
                                label="Thời gian kết thúc"
                                showTimePicker={true} // Chọn ngày và giờ
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                Thời gian hiện tại: {format(field.value, "HH:mm dd/MM/yyyy", { locale: vi })}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Status"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel>Trạng thái hoạt động</FormLabel>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit">{initialData?.Id ? "Cập nhật" : "Tạo mới"}</Button>
                </div>
            </form>
        </Form>
    );
}