'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { userService, provinceService, wardService } from '@/lib/api';
import { UserFormData, User } from '@/types/user';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { vi } from 'date-fns/locale';

interface Province {
    Id: number;
    Name: string;
    Region: string;
}

interface Ward {
    Id: number;
    Name: string;
}

interface ApiResponse<T> {
    total: number;
    items: T[];
}

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User;
    onSuccess: () => void;
}

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        Username: '',
        Email: '',
        Password: '',
        Role: 'HTX',
        OrganizationName: '',
        Name: '',
        Type: 'NN',
        ProvinceId: undefined,
        WardId: undefined,
        Address: '',
        Position: '',
        MemberCount: undefined,
        EstablishedDate: undefined,
        IsMember: true,
        Status: true,
        IsLocked: false,
        SurveyStatus: false,
        SurveyTime: undefined,
    });
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedWardName, setSelectedWardName] = useState<string>('');
    const [usernameError, setUsernameError] = useState<string>('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    const isNonAdmin = formData.Role !== 'admin';
    const isLMHTX = formData.Role === 'LMHTX';

    // Different required fields based on role
    const requiredFields = isNonAdmin
        ? isLMHTX
            ? ['ProvinceId'] // LMHTX only requires Province
            : ['ProvinceId', 'WardId', 'OrganizationName', 'Name', 'Type', 'Address', 'Position', 'MemberCount', 'EstablishedDate', 'IsMember']
        : [];

    useEffect(() => {
        provinceService.getProvinces().then((response: ApiResponse<Province>) => {
            setProvinces(response.items);
        });
    }, []);

    useEffect(() => {
        if (formData.ProvinceId) {
            wardService.getWardsByProvinceId(formData.ProvinceId).then((response: ApiResponse<Ward>) => {
                setWards(response.items);

                if (formData.WardId) {
                    const ward = response.items.find(w => w.Id === formData.WardId);
                    if (ward) {
                        setSelectedWardName(ward.Name);
                    }
                }
            });
        } else {
            setWards([]);
        }
    }, [formData.ProvinceId, formData.WardId]);

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                Password: '',
            });

            if (user.ProvinceId) {
                wardService.getWardsByProvinceId(user.ProvinceId).then((response: ApiResponse<Ward>) => {
                    setWards(response.items);

                    if (user.WardId) {
                        const ward = response.items.find(w => w.Id === user.WardId);
                        if (ward) {
                            setSelectedWardName(ward.Name);
                        }
                    }

                });
            }
        }
    }, [user]);

    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy');
    };

    const formatDateForDisplay = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy');
    };

    const parseDate = (date?: Date) => {
        if (!date) return undefined;
        return format(date, 'yyyy-MM-dd');
    };

    const convertStringToDate = (dateString?: string) => {
        if (!dateString) return undefined;
        try {
            return new Date(dateString);
        } catch (error) {
            return undefined;
        }
    };

    // Check if username already exists
    const checkUsernameExists = async (username: string) => {
        if (!username) return false;
        if (user && user.Username === username) return false; // Skip check if editing and username hasn't changed

        setIsCheckingUsername(true);
        try {
            const response = await userService.checkUsername(username);
            setIsCheckingUsername(false);
            return response.exists;
        } catch (error) {
            setIsCheckingUsername(false);
            return false;
        }
    };

    // Handle username change with debounce
    useEffect(() => {
        setUsernameError('');

        const timer = setTimeout(async () => {
            if (formData.Username) {
                const exists = await checkUsernameExists(formData.Username);
                if (exists) {
                    setUsernameError('Tên đăng nhập đã tồn tại');
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.Username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields = [];
        if (!formData.Username) missingFields.push('Tên đăng nhập');
        if (!user && !formData.Password) missingFields.push('Mật khẩu');
        if (!formData.Role) missingFields.push('Vai trò');

        // Check required fields based on role
        if (isNonAdmin) {
            requiredFields.forEach((field) => {
                if (formData[field as keyof UserFormData] === undefined || formData[field as keyof UserFormData] === '') {
                    let fieldName = field;
                    if (field === 'ProvinceId') fieldName = 'Tỉnh/Thành phố';
                    if (field === 'WardId') fieldName = 'Phường/Xã';
                    if (field === 'OrganizationName') fieldName = 'Tên tổ chức';
                    if (field === 'Name') fieldName = 'Tên người quản lý';
                    if (field === 'Type') fieldName = 'Loại';
                    if (field === 'Address') fieldName = 'Địa chỉ';
                    if (field === 'Position') fieldName = 'Chức vụ';
                    if (field === 'MemberCount') fieldName = 'Số lượng thành viên';
                    if (field === 'EstablishedDate') fieldName = 'Ngày thành lập';
                    missingFields.push(fieldName);
                }
            });
        }

        if (missingFields.length > 0) {
            toast.error(`Vui lòng điền vào các trường bắt buộc: ${missingFields.join(', ')} `);
            return;
        }

        // Check if username already exists
        if (!user || (user && user.Username !== formData.Username)) {
            const usernameExists = await checkUsernameExists(formData.Username);
            if (usernameExists) {
                toast.error('Tên đăng nhập đã tồn tại');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            if (user) {
                const updateData = { ...formData };
                if (!updateData.Password) {
                    delete updateData.Password;
                }
                await userService.updateUser(user.Id, updateData);
                toast.success('Cập nhật người dùng thành công');
            } else {
                await userService.createUser(formData);
                toast.success('Tạo người dùng thành công');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Lưu người dùng thất bại');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">{user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="Username">Tên đăng nhập <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="Username"
                                        value={formData.Username}
                                        onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                                        required
                                        className={usernameError ? "border-red-500" : ""}
                                        disabled={!!user}
                                    />
                                    {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
                                    {isCheckingUsername && <p className="text-sm text-blue-500">Đang kiểm tra tên đăng nhập...</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Email">Email</Label>
                                    <Input
                                        id="Email"
                                        type="email"
                                        value={formData.Email || ''}
                                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Password">{user ? 'Mật khẩu (để trống nếu không thay đổi)' : 'Mật khẩu'} {!user && <span className="text-red-500">*</span>}</Label>
                                    <Input
                                        id="Password"
                                        type="password"
                                        value={formData.Password || ''}
                                        onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                        required={!user}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Role">Vai trò <span className="text-red-500">*</span></Label>
                                    <Select 
                                        value={formData.Role} 
                                        onValueChange={(value) => setFormData({ ...formData, Role: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LMHTX">LMHTX</SelectItem>
                                            <SelectItem value="QTD">Quỹ tín dụng</SelectItem>
                                            <SelectItem value="HTX">Hợp tác xã</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="UBKT">UBKT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Status">Trạng thái</Label>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="Status" checked={formData.Status || false} onCheckedChange={(checked) => setFormData({ ...formData, Status: checked })} />
                                        <Label htmlFor="Status" className="cursor-pointer">
                                            {formData.Status ? 'Hoạt động' : 'Không hoạt động'}
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {isNonAdmin && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Thông tin tổ chức</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="OrganizationName">Tên tổ chức {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <Input
                                            id="OrganizationName"
                                            value={formData.OrganizationName || ''}
                                            onChange={(e) => setFormData({ ...formData, OrganizationName: e.target.value })}
                                            required={!isLMHTX}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="Name">Tên người quản lý {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <Input
                                            id="Name"
                                            value={formData.Name || ''}
                                            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                            required={!isLMHTX}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="Type">Loại hình {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <Select
                                            value={formData.Type}
                                            onValueChange={(value) => setFormData({ ...formData, Type: value as any })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PNN">Phi nông nghiệp</SelectItem>
                                                <SelectItem value="NN">Nông nghiệp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="Position">Chức vụ {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <Input
                                            id="Position"
                                            value={formData.Position || ''}
                                            onChange={(e) => setFormData({ ...formData, Position: e.target.value })}
                                            required={!isLMHTX}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="MemberCount">Số lượng thành viên {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <Input
                                            id="MemberCount"
                                            type="number"
                                            value={formData.MemberCount !== undefined ? formData.MemberCount : ''}
                                            onChange={(e) => setFormData({ ...formData, MemberCount: parseInt(e.target.value) || undefined })}
                                            required={!isLMHTX}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="EstablishedDate">Ngày thành lập {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <DatePicker
                                            date={formData.EstablishedDate ? convertStringToDate(formData.EstablishedDate) : undefined}
                                            onSelect={(date) => setFormData({ ...formData, EstablishedDate: date ? parseDate(date) : undefined })}
                                            placeholder="Chọn ngày thành lập"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="IsMember">Là thành viên</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="IsMember"
                                                checked={formData.IsMember || false}
                                                onCheckedChange={(checked) => setFormData({ ...formData, IsMember: checked })}
                                            />
                                            <Label htmlFor="IsMember" className="cursor-pointer">
                                                {formData.IsMember ? 'Có' : 'Không'}
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isNonAdmin && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Thông tin địa điểm</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ProvinceId">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.ProvinceId ? formData.ProvinceId.toString() : undefined}
                                            onValueChange={(value) => setFormData({ ...formData, ProvinceId: parseInt(value), WardId: undefined })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((province) => (
                                                    <SelectItem key={province.Id} value={province.Id.toString()}>
                                                        {province.Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="WardId">Phường/Xã {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                        <Select
                                            value={formData.WardId ? formData.WardId.toString() : undefined}
                                            onValueChange={(value) => {
                                                const wardId = parseInt(value);
                                                setFormData({ ...formData, WardId: wardId });
                                                const selectedWard = wards.find(w => w.Id === wardId);
                                                if (selectedWard) {
                                                    setSelectedWardName(selectedWard.Name);
                                                }
                                            }}
                                            disabled={!formData.ProvinceId || wards.length === 0}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={wards.length > 0 ? "Chọn phường/xã" : "Chọn tỉnh/thành phố trước"}>
                                                    {selectedWardName || "Chọn phường/xã"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wards.map((ward) => (
                                                    <SelectItem key={ward.Id} value={ward.Id.toString()}>
                                                        {ward.Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Address">Địa chỉ {!isLMHTX && <span className="text-red-500">*</span>}</Label>
                                    <Input
                                        id="Address"
                                        value={formData.Address || ''}
                                        onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                        required={!isLMHTX}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}