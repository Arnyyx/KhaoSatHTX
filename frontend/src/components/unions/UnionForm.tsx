"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { User } from "@/types/user";
import { provinceService, wardService } from "@/lib/api";

// Define the form schema with zod
const formSchema = z.object({
    username: z.string().min(1, "Username là bắt buộc").max(50),
    organizationName: z.string().min(1, "Tên tổ chức là bắt buộc").max(255),
    name: z.string().min(1, "Tên người quản lý là bắt buộc").max(255),
    password: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 6, {
            message: "Mật khẩu phải có ít nhất 6 ký tự",
        }),
    role: z.enum(["HTX", "QTD"]),
    email: z.string().email("Email không hợp lệ").max(100),
    type: z.enum(["NN", "PNN"]),
    wardId: z.number().int().positive("Vui lòng chọn xã"),
    address: z.string().min(1, "Địa chỉ là bắt buộc").max(255),
    position: z.string().min(1, "Chức vụ là bắt buộc").max(100),
    numberCount: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
    establishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Ngày thành lập không hợp lệ",
    }),
    member: z.enum(["TV", "KTV"]),
    status: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// Define props for UnionForm
interface UnionFormProps {
    user?: User;
    onSubmit: (data: FormValues) => Promise<void>;
    onCancel: () => void;
}

export function UnionForm({ user, onSubmit, onCancel }: UnionFormProps) {
    const [wards, setWards] = useState<{ Id: number; Name: string }[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: user
            ? {
                username: user.Username,
                organizationName: user.OrganizationName || "",
                name: user.Name || "",
                password: "",
                role: user.Role as "HTX" | "QTD",
                email: user.Email,
                type: user.Type as "NN" | "PNN",
                wardId: user.WardId || 0,
                address: user.Address || "",
                position: user.Position || "",
                numberCount: user.NumberCount || 1,
                establishedDate: user.EstablishedDate ? user.EstablishedDate.split("T")[0] : "",
                member: user.Member as "TV" | "KTV",
                status: user.Status || false,
            }
            : {
                username: "",
                organizationName: "",
                name: "",
                password: "",
                role: "HTX",
                email: "",
                type: "NN",
                wardId: 0,
                address: "",
                position: "",
                numberCount: 1,
                establishedDate: "",
                member: "TV",
                status: true,
            },
    });

    // Fetch wards when component mounts
    useEffect(() => {
        if (user?.ProvinceId) {
            wardService.getWardsByProvinceId(user.ProvinceId)
                .then(response => {
                    setWards(response.items);
                })
                .catch(error => {
                    console.error("Error fetching wards:", error);
                });
        }
    }, [user?.ProvinceId]);

    function handleSubmit(values: FormValues) {
        onSubmit(values);
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">
                {user ? "Sửa Hợp tác xã/Quỹ tín dụng" : "Tạo Hợp tác xã/Quỹ tín dụng"}
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="organizationName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên tổ chức</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên tổ chức" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên người quản lý</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên người quản lý" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!user && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Nhập mật khẩu"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="role"
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
                                            <SelectItem value="HTX">Hợp tác xã</SelectItem>
                                            <SelectItem value="QTD">Quỹ tín dụng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại hình</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại hình" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="NN">Nông nghiệp</SelectItem>
                                            <SelectItem value="PNN">Phi nông nghiệp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="wardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Xã</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        defaultValue={field.value.toString()}
                                        disabled={!wards.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn xã" />
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
                            name="address"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Địa chỉ</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập địa chỉ cụ thể" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chức vụ</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập chức vụ" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numberCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số lượng</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Nhập số lượng"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="establishedDate"
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
                            name="member"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại thành viên</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại thành viên" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="TV">Thành viên</SelectItem>
                                            <SelectItem value="KTV">Không thành viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trạng thái</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Hoạt động</SelectItem>
                                            <SelectItem value="false">Không hoạt động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end mt-6 space-x-2">
                        <Button type="submit">{user ? "Cập nhật" : "Tạo"}</Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}