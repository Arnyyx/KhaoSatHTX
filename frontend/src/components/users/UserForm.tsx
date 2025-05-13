'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService, provinceService, wardService } from '@/lib/api';
import { UserFormData, User } from '@/types/user';
import { toast } from 'sonner';

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
        Type: undefined,
        ProvinceId: undefined,
        WardId: undefined,
        Address: '',
        Position: '',
        NumberCount: undefined,
        EstablishedDate: undefined,
        Member: undefined,
        Status: undefined,
        IsLocked: undefined,
        SurveyStatus: undefined,
        SurveyTime: undefined,
    });
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isNonAdmin = formData.Role !== 'admin';
    const requiredFields = isNonAdmin
        ? ['ProvinceId', 'WardId', 'OrganizationName', 'Name', 'Type', 'Address', 'Position', 'NumberCount', 'EstablishedDate', 'Member']
        : [];

    useEffect(() => {
        provinceService.getProvinces().then((response: ApiResponse<Province>) => {
            setProvinces(response.items);
        });

        if (formData.ProvinceId) {
            wardService.getWardsByProvinceId(formData.ProvinceId).then((response: ApiResponse<Ward>) => {
                setWards(response.items);
            });
        } else {
            setWards([]);
        }
    }, [formData.ProvinceId]);

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                Password: '', // Clear password when editing
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields = [];
        if (!formData.Username) missingFields.push('Username');
        if (!formData.Email) missingFields.push('Email');
        if (!user && !formData.Password) missingFields.push('Password');
        if (!formData.Role) missingFields.push('Role');
        if (isNonAdmin) {
            requiredFields.forEach((field) => {
                if (formData[field as keyof UserFormData] === undefined || formData[field as keyof UserFormData] === '') {
                    missingFields.push(field);
                }
            });
        }

        if (missingFields.length > 0) {
            toast.error(`Please fill in required fields: ${missingFields.join(', ')} `);
            return;
        }

        setIsSubmitting(true);
        try {
            if (user) {
                const updateData = { ...formData };
                if (!updateData.Password) {
                    delete updateData.Password;
                }
                await userService.updateUser(user.Id, updateData);
                toast.success('User updated successfully');
            } else {
                await userService.createUser(formData);
                toast.success('User created successfully');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="Username" className="text-right">Username *</Label>
                            <Input
                                id="Username"
                                value={formData.Username}
                                onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="Email" className="text-right">Email *</Label>
                            <Input
                                id="Email"
                                type="email"
                                value={formData.Email}
                                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="Password" className="text-right">Password {user ? '' : '*'}</Label>
                            <Input
                                id="Password"
                                type="password"
                                value={formData.Password || ''}
                                onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                className="col-span-3"
                                required={!user}
                                placeholder={user ? 'Leave blank to keep unchanged' : ''}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="Role" className="text-right">Role *</Label>
                            <Select
                                value={formData.Role}
                                onValueChange={(value) => setFormData({ ...formData, Role: value as any })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LMHTX">LMHTX</SelectItem>
                                    <SelectItem value="QTD">QTD</SelectItem>
                                    <SelectItem value="HTX">HTX</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {isNonAdmin && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="OrganizationName" className="text-right">Organization Name *</Label>
                                    <Input
                                        id="OrganizationName"
                                        value={formData.OrganizationName || ''}
                                        onChange={(e) => setFormData({ ...formData, OrganizationName: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Name" className="text-right">Name *</Label>
                                    <Input
                                        id="Name"
                                        value={formData.Name || ''}
                                        onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Type" className="text-right">Type *</Label>
                                    <Select
                                        value={formData.Type}
                                        onValueChange={(value) => setFormData({ ...formData, Type: value as any })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PNN">PNN</SelectItem>
                                            <SelectItem value="NN">NN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="ProvinceId" className="text-right">Province *</Label>
                                    <Select
                                        value={formData.ProvinceId ? formData.ProvinceId.toString() : undefined}
                                        onValueChange={(value) => setFormData({ ...formData, ProvinceId: parseInt(value), WardId: undefined })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select province" />
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
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="WardId" className="text-right">Ward *</Label>
                                    <Select
                                        value={formData.WardId ? formData.WardId.toString() : undefined}
                                        onValueChange={(value) => setFormData({ ...formData, WardId: parseInt(value) })}
                                        disabled={!formData.ProvinceId}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select ward" />
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
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Address" className="text-right">Address *</Label>
                                    <Input
                                        id="Address"
                                        value={formData.Address || ''}
                                        onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Position" className="text-right">Position *</Label>
                                    <Input
                                        id="Position"
                                        value={formData.Position || ''}
                                        onChange={(e) => setFormData({ ...formData, Position: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="NumberCount" className="text-right">Number Count *</Label>
                                    <Input
                                        id="NumberCount"
                                        type="number"
                                        value={formData.NumberCount !== undefined ? formData.NumberCount : ''}
                                        onChange={(e) => setFormData({ ...formData, NumberCount: parseInt(e.target.value) || undefined })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="EstablishedDate" className="text-right">Established Date *</Label>
                                    <Input
                                        id="EstablishedDate"
                                        type="date"
                                        value={formData.EstablishedDate || ''}
                                        onChange={(e) => setFormData({ ...formData, EstablishedDate: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Member" className="text-right">Member *</Label>
                                    <Select
                                        value={formData.Member}
                                        onValueChange={(value) => setFormData({ ...formData, Member: value as any })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="KTV">KTV</SelectItem>
                                            <SelectItem value="TV">TV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}