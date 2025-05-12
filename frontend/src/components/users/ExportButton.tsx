// components/users/ExportButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { userService } from '@/lib/api';
import { toast } from 'sonner';

interface ExportButtonProps {
    selectedIds: number[];
}

export function ExportButton({ selectedIds }: ExportButtonProps) {
    const handleExport = async () => {
        try {
            const response = await userService.exportUsers(selectedIds);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Users exported successfully');
        } catch (error) {
            toast.error('Failed to export users');
        }
    };

    return (
        <Button onClick={handleExport} disabled={selectedIds.length === 0}>
            Export Selected
        </Button>
    );
}