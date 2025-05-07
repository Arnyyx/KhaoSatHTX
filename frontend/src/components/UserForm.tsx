"use client";

import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { provinceService, userService, wardService } from "@/lib/api";

interface Province {
    Id: number;
    Name: string;
}

interface Ward {
    Id: number;
    Name: string;
}
interface UserFormProps {
    initialData?: {
        Id?: number;
        Username: string;
        Name?: string | null;
        Email: string;
        Role: "LMHTX" | "QTD" | "HTX" | "admin";
        Type: "PNN" | "NN";
        OrganizationName?: string | null;
        Address?: string | null;
        Position?: string | null;
        NumberCount?: number | null;
        EstablishedDate?: string | null;
        Member?: string | null;
        Status?: boolean | null;
        IsLocked?: boolean | null;
        SurveyStatus?: boolean | null;
        SurveyTime?: number | null;
        ProvinceId?: number | null;
        WardId?: number | null;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const formSchema = z.object({
    Username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
    Email: z.string().email("Email không hợp lệ"),
    Password: z.string().optional(),
    Name: z.string().optional(),
    OrganizationName: z.string().optional(),
    Role: z.enum(["LMHTX", "QTD", "HTX", "admin"], {
        errorMap: () => ({ message: "Vui lòng chọn vai trò" }),
    }),
    Type: z.enum(["PNN", "NN"], {
        errorMap: () => ({ message: "Vui lòng chọn loại" }),
    }),
    Address: z.string().optional(),
    Position: z.string().optional(),
    NumberCount: z.number().optional(),
    EstablishedDate: z.string().optional(),
    Member: z.string().optional(),
    Status: z.boolean().optional(),
    IsLocked: z.boolean().optional(),
    SurveyStatus: z.boolean().optional(),
    SurveyTime: z.number().optional(),
    ProvinceId: z.number().optional(),
    WardId: z.number().optional(),
}).superRefine((data, ctx) => {
    if (!data.Password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mật khẩu là bắt buộc khi tạo mới",
            path: ["Password"],
        });
    }
});

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Username: initialData?.Username || "",
            Email: initialData?.Email || "",
            Password: "",
            Name: initialData?.Name || "",
            OrganizationName: initialData?.OrganizationName || "",
            Role: initialData?.Role || "LMHTX",
            Type: initialData?.Type || "PNN",
            Address: initialData?.Address || "",
            Position: initialData?.Position || "",
            NumberCount: initialData?.NumberCount || undefined,
            EstablishedDate: initialData?.EstablishedDate || "",
            Member: initialData?.Member || "",
            Status: initialData?.Status ?? true,
            IsLocked: initialData?.IsLocked ?? false,
            SurveyStatus: initialData?.SurveyStatus ?? false,
            SurveyTime: initialData?.SurveyTime || undefined,
            ProvinceId: initialData?.ProvinceId || undefined,
            WardId: initialData?.WardId || undefined,
        },
    });
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await provinceService.getProvinces();
                setProvinces(response);
            } catch (error) {
                console.error("Lỗi khi tải provinces:", error);
            }
        };

        const fetchWards = async () => {
            try {
                const response = await wardService.getWards();
                setWards(response);
            } catch (error) {
                console.error("Lỗi khi tải wards:", error);
            }
        };

        fetchProvinces();
        fetchWards();
    }, []);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit({
            ...values,
            NumberCount: values.NumberCount || null,
            EstablishedDate: values.EstablishedDate || null,
            ProvinceId: values.ProvinceId || null,
            WardId: values.WardId || null,
            SurveyTime: values.SurveyTime || null,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="Username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên đăng nhập</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập tên đăng nhập" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập email" type="email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={initialData ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem

                            >
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ tên</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập họ tên" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vai trò</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="LMHTX">LMHTX</SelectItem>
                                        <SelectItem value="QTD">QTD</SelectItem>
                                        <SelectItem value="HTX">HTX</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loại</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PNN">PNN</SelectItem>
                                        <SelectItem value="NN">NN</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="OrganizationName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên tổ chức</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập tên tổ chức" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Địa chỉ</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập địa chỉ" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Chức vụ</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập chức vụ" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="NumberCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số lượng</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="Nhập số lượng"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="EstablishedDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày thành lập</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Member"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thành viên</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập thông tin thành viên" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ProvinceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tỉnh</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    defaultValue={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tỉnh" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem
                                                key={province.Id}
                                                value={province.Id.toString()}
                                            >
                                                {province.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="WardId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phường/Xã</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    defaultValue={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn phường/xã" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {wards.map((ward) => (
                                            <SelectItem
                                                key={ward.Id}
                                                value={ward.Id.toString()}
                                            >
                                                {ward.Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SurveyTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thời gian khảo sát</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="Nhập thời gian khảo sát"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex space-x-4">
                    <FormField
                        control={form.control}
                        name="Status"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel>Trạng thái</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="IsLocked"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel>Khóa tài khoản</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SurveyStatus"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel>Trạng thái khảo sát</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit">Lưu</Button>
                </div>
            </form>
        </Form>
    );
}