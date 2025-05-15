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
import { provinceService, wardService, userService } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Define the form schema with zod
const formSchema = z.object({
    username: z.string().min(1, "Username là bắt buộc").max(50),
    password: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 6, {
            message: "Mật khẩu phải có ít nhất 6 ký tự",
        }),
    organizationName: z.string().min(1, "Tên tổ chức là bắt buộc").max(255),
    role: z.enum(["HTX", "QTD"]),
    type: z.enum(["NN", "PNN"]),
    name: z.string().min(1, "Tên người quản lý là bắt buộc").max(255),
    position: z.string().min(1, "Chức vụ là bắt buộc").max(100),
    email: z.union([
        z.string().email("Email không hợp lệ").max(100),
        z.string().max(0)
    ]),
    wardId: z.number().int().positive("Vui lòng chọn xã"),
    address: z.string().min(1, "Địa chỉ là bắt buộc").max(255),
    memberCount: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
    establishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Ngày thành lập không hợp lệ",
    }),
    isMember: z.boolean(),
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
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameExists, setUsernameExists] = useState(false);
    const [originalUsername, setOriginalUsername] = useState(user?.Username || "");
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: user
            ? {
                username: user.Username,
                organizationName: user.OrganizationName || "",
                name: user.Name || "",
                password: "",
                role: user.Role as "HTX" | "QTD",
                email: user.Email || "",
                type: user.Type as "NN" | "PNN",
                wardId: user.WardId || 0,
                address: user.Address || "",
                position: user.Position || "",
                memberCount: user.MemberCount || 1,
                establishedDate: user.EstablishedDate ? user.EstablishedDate.split("T")[0] : "",
                isMember: user.IsMember !== undefined ? user.IsMember : true,
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
                memberCount: 1,
                establishedDate: "",
                isMember: true, // Default to true
                status: true,
            },
    });

    // Fetch wards from current user's province ID
    useEffect(() => {
        const fetchWards = async () => {
            try {
                setLoading(true);
                // Get current user's province ID from cookies or another source
                const userId = parseInt(localStorage.getItem("userId") || Cookies.get("userId") || "0");
                if (userId) {
                    const userResponse = await userService.getUserById(userId);
                    if (userResponse?.user?.ProvinceId) {
                        const response = await wardService.getWardsByProvinceId(userResponse.user.ProvinceId);
                        setWards(response.items);
                    }
                } else if (user?.ProvinceId) {
                    // Fallback to user's province if available
                    const response = await wardService.getWardsByProvinceId(user.ProvinceId);
                    setWards(response.items);
                }
            } catch (error) {
                console.error("Error fetching wards:", error);
                toast.error("Lỗi khi lấy danh sách phường/xã");
            } finally {
                setLoading(false);
            }
        };
        
        fetchWards();
    }, [user?.ProvinceId]);

    // Check if username exists
    const checkUsername = async (username: string) => {
        if (!username || username === originalUsername) {
            setUsernameExists(false);
            return;
        }

        try {
            setCheckingUsername(true);
            const response = await userService.checkUsername(username);
            setUsernameExists(response.exists);
            setCheckingUsername(false);
            
            if (response.exists) {
                form.setError("username", {
                    type: "manual",
                    message: "Username đã tồn tại trong hệ thống"
                });
            } else {
                form.clearErrors("username");
            }
        } catch (error) {
            console.error("Error checking username:", error);
            setCheckingUsername(false);
        }
    };

    // Watch username changes and check after typing stops
    const username = form.watch("username");
    useEffect(() => {
        const timer = setTimeout(() => {
            checkUsername(username);
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    // Format date to DD/MM/YYYY
    const formatDate = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    async function handleSubmit(values: FormValues) {
        // Check username one more time before submitting
        if (!user && usernameExists) {
            toast.error("Username đã tồn tại, vui lòng chọn username khác");
            return;
        }
        
        await onSubmit(values);
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">
                {user ? "Sửa Hợp tác xã/Quỹ tín dụng" : "Tạo Hợp tác xã/Quỹ tín dụng"}
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Thông tin tài khoản */}
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-medium mb-2">Thông tin tài khoản</h2>
                        </div>

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input 
                                                placeholder="Nhập username" 
                                                {...field} 
                                                className={usernameExists ? "border-red-500" : ""}
                                                disabled={!!user}
                                            />
                                            {checkingUsername && (
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                                    Đang kiểm tra...
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    {usernameExists ? (
                                        <p className="text-sm text-red-500">Username đã tồn tại</p>
                                    ) : (
                                        <FormMessage />
                                    )}
                                </FormItem>
                            )}
                        />

                        {!user && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu {!user && <span className="text-red-500">*</span>}</FormLabel>
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

                        {/* Thông tin tổ chức */}
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-medium mb-2 mt-4">Thông tin tổ chức</h2>
                        </div>

                        <FormField
                            control={form.control}
                            name="organizationName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên tổ chức <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên tổ chức" {...field} />
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
                                    <FormLabel>Loại <span className="text-red-500">*</span></FormLabel>
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại hình <span className="text-red-500">*</span></FormLabel>
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
                            name="memberCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số thành viên <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Nhập số thành viên"
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
                                    <FormLabel>Ngày thành lập <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date" 
                                            {...field} 
                                            onChange={(e) => {
                                                field.onChange(e);
                                                console.log('Selected date:', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isMember"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Là thành viên</FormLabel>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <Label>{field.value ? "Có" : "Không"}</Label>
                                    </div>
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

                        {/* Thông tin người quản lý */}
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-medium mb-2 mt-4">Thông tin người quản lý</h2>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên người quản lý <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên người quản lý" {...field} />
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
                                    <FormLabel>Chức vụ <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập chức vụ" {...field} />
                                    </FormControl>
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

                        {/* Thông tin địa chỉ */}
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-medium mb-2 mt-4">Thông tin địa chỉ</h2>
                        </div>

                        <FormField
                            control={form.control}
                            name="wardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phường/Xã <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        defaultValue={field.value ? field.value.toString() : undefined}
                                        disabled={loading || !wards.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loading ? "Đang tải..." : "Chọn phường/xã"} />
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
                                <FormItem className="md:col-span-1">
                                    <FormLabel>Địa chỉ cụ thể <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập địa chỉ cụ thể" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end mt-6 space-x-2">
                        <Button type="submit" disabled={!user && usernameExists}>
                            {user ? "Cập nhật" : "Tạo"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}