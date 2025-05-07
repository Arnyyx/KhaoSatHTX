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

// Định nghĩa schema validation với zod
const formSchema = z.object({
    username: z.string().min(1, "Username là bắt buộc").max(50),
    organizationName: z.string().min(1, "Tên tổ chức là bắt buộc").max(255),
    name: z.string().min(1, "Tên người quản lý là bắt buộc").max(255),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(255),
    role: z.enum(["HTX", "QTD"]),
    email: z.string().email("Email không hợp lệ").max(100),
    type: z.enum(["NN", "PNN"]),
    provinceId: z.number().int().positive("Vui lòng chọn tỉnh"),
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

// Mock API để lấy danh sách tỉnh và xã
async function fetchProvinces() {
    // Thay bằng API thực tế
    return [
        { id: 1, name: "Hà Nội" },
        { id: 2, name: "TP. Hồ Chí Minh" },
    ];
}

async function fetchWards(provinceId: number) {
    // Thay bằng API thực tế
    return [
        { id: 1, name: "Xã A", provinceId: 1 },
        { id: 2, name: "Xã B", provinceId: 1 },
        { id: 3, name: "Xã C", provinceId: 2 },
    ];
}

export function CooperativeForm() {
    const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
    const [wards, setWards] = useState<{ id: number; name: string }[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            organizationName: "",
            name: "",
            password: "",
            role: "HTX",
            email: "",
            type: "NN",
            provinceId: 0,
            wardId: 0,
            address: "",
            position: "",
            numberCount: 1,
            establishedDate: "",
            member: "TV",
            status: true,
        },
    });

    // Lấy danh sách tỉnh khi component mount
    useEffect(() => {
        fetchProvinces().then(setProvinces);
    }, []);

    // Lấy danh sách xã khi tỉnh thay đổi
    useEffect(() => {
        const provinceId = form.watch("provinceId");
        if (provinceId) {
            fetchWards(provinceId).then((wards) =>
                setWards(wards.filter((ward) => ward.provinceId === provinceId))
            );
        }
    }, [form.watch("provinceId")]);

    // Xử lý submit form
    function onSubmit(values: FormValues) {
        console.log(values);
        // Gửi dữ liệu đến API hoặc xử lý tiếp
    }

    return (
        <div >
            <h1 className="text-xl font-bold mb-4">Tạo Hợp tác xã/Quỹ tín dụng</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                            name="provinceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tỉnh</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        defaultValue={field.value.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn tỉnh" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem
                                                    key={province.id}
                                                    value={province.id.toString()}
                                                >
                                                    {province.name}
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
                                                <SelectItem key={ward.id} value={ward.id.toString()}>
                                                    {ward.name}
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
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
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

                    <div className="flex justify-end mt-6">
                        <Button type="submit">Tạo</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}