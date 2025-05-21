// components/users/ExportButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { userService } from '@/lib/api';
import { toast } from 'sonner';
import { excelUtils } from '@/lib/excel-utils';
import { Download } from 'lucide-react';

interface ExportButtonProps {
    selectedIds: number[];
    users?: any[];
    provinces?: any[];
    wards?: any[];
}

export function ExportButton({ selectedIds, users, provinces, wards }: ExportButtonProps) {
    const handleExport = async () => {
        // If users data is provided, use client-side export with excel-utils
        if (users && users.length > 0) {
            try {
                const selectedUsers = selectedIds.length > 0 
                    ? users.filter(user => selectedIds.includes(user.Id))
                    : users;
                
                excelUtils.exportUsersToExcel(selectedUsers, provinces, wards);
                toast.success('Xuất dữ liệu thành công', {
                    description: `Đã xuất ${selectedUsers.length} bản ghi.`
                });
            } catch (error: any) {
                console.error('Lỗi khi xuất Excel:', error);
                toast.error('Lỗi khi xuất dữ liệu', {
                    description: error.message
                });
            }
        } 
        // If no users data, call the API to export
        else {
            try {
                const response = await userService.exportUsers(selectedIds);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'danh_sach_nguoi_dung.xlsx');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Xuất dữ liệu thành công');
            } catch (error) {
                toast.error('Lỗi khi xuất dữ liệu');
            }
        }
    };

    return (
        <Button onClick={handleExport} disabled={selectedIds.length === 0} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
        </Button>
    );
}