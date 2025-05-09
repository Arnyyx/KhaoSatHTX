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
            toast.success('User(s) deleted successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to delete user(s)');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {userIds.length} user(s)? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}