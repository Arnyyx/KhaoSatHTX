// components/users/DeleteDialog.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { userService } from '@/lib/api';
import { toast } from 'sonner';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userIds: number[];
    onSuccess: () => void;
}

export function DeleteDialog({ open, onOpenChange, userIds, onSuccess }: DeleteDialogProps) {
    const handleDelete = async () => {
        try {
            if (userIds.length === 1) {
                await userService.deleteUser(userIds[0]);
            } else {
                await userService.deleteMultipleUsers(userIds);
            }
            toast.success('Xóa người dùng thành công');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error('Lỗi khi xóa người dùng');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa {userIds.length} người dùng? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}