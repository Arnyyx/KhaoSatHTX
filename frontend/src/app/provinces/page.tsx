"use client"

import { use, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, BarChart2 } from "lucide-react";
import { API } from "@/lib/api"
import { Config } from "@/lib/config"
import Pagination from '@/lib/Pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
type Info = {
    Id: number
    Name: string
    Region: string
}
export default function InfoTablePage() {
    // #region Biến
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchText, setSearchText] = useState("");
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const [currentPage, setCurrentPage] = useState(page);
    const [totalPages, setTotalPages] = useState(1);

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [oldName, setOldName] = useState("");
    const [infoFormData, setInfoFormData] = useState({
        Name: "",
        Region: "",
    });
    const [editFormData, setEditFormData] = useState<Info>({
        Id: -1,
        Name: "",
        Region: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [infoList, setInfoList] = useState<Info[]>([])    
    // #endregion
    // #region Insert + Edit
    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editMode) {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
        else {
            setInfoFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
            try {
                const res = await fetch(`${API.provinces}/sua`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editFormData),
                });

                if (!res.ok) {
                    const errMsg = await res.text();
                    alert("Lỗi cập nhật: " + errMsg);
                    return;
                }

                console.log("Submitted successfully", editFormData);
                setEditFormData({Id: -1, Name: "", Region: "" })
                setEditMode(false)
                fetchInfo(currentPage);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            try {
                const res = await fetch(API.provinces, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(infoFormData),
                });

                if (!res.ok) {
                    const errText = await res.text(); // đọc lỗi trả về từ SQL
                    alert("Lỗi: " + errText);
                    return;
                }

                console.log("Submitted successfully", infoFormData);
                setInfoFormData({ Name: "", Region: "" })
                fetchInfo(currentPage);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
        setInfoDialogOpen(false);
    };
    const handleEditClick = (data: Info) => {
        setOldName(data.Name); // Lưu tên cũ để so sánh
        setEditFormData(data); // Truyền thông tin vào form
        setEditMode(true); // Chế độ sửa
        setInfoDialogOpen(true); // Mở Dialog
    };
    // #endregion
    // #region Del
    const handleDelClick = async (data: {Id: number}) => {
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if (isConfirmed) {
            try {
                setSelectedIds([data.Id])
                const res = await fetch(`${API.provinces}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: [data.Id] }),
                });
                if (!res.ok) throw new Error("Delete failed");
                await fetchInfo(currentPage);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            console.log('Hủy');
        }
    };
    const handleCheckboxChange = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };
    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedIds([]); // bỏ chọn tất cả
        } else {
            const allIds = infoList.map(item => item.Id);
            setSelectedIds(allIds);
        }
        setSelectAll(!selectAll);
    };
    
    const handleDeleteMultiple = async () => {
        const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mục?`);
        if (!isConfirmed) return;
      
        try {
            const res = await fetch(`${API.provinces}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: selectedIds }),
            });
      
          if (!res.ok) {
            const errText = await res.text();
            alert("Lỗi: " + errText);
            return;
          }
          setSelectedIds([]);
          fetchInfo(currentPage);
        } catch (error) {
          console.error("Error deleting multiple:", error);
        }
    };
    // #endregion
    // #region Import Excel
    const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
      
        const res = await fetch(`${API.provinces}/import`, {
          method: 'POST',
          body: formData,
        });
      
        const text = await res.text();
        alert(text);
        fetchInfo(currentPage);
    };
    // #endregion
    const fetchInfo = async (page: number) => {
        try {
            const response = await fetch(`${API.provinces}?page=${page}&page_size=${Config.pageSize}&search=${encodeURIComponent(searchText)}`);
            const data = await response.json();
            setInfoList(data.items);
            const total = Math.ceil(data.total / Config.pageSize);
            setTotalPages(total);

            if (data.items.length === 0 && page > 1) {
                setCurrentPage(page - 1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {
        fetchInfo(currentPage)
        const allSelected = infoList.length > 0 && infoList.every(item => selectedIds.includes(item.Id));
        setSelectAll(allSelected);
    }, [currentPage])

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-3xl">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Quản lý Tỉnh/Thành phố</h2>
                        <Dialog open={infoDialogOpen} onOpenChange={(isOpen) => {
                            setInfoDialogOpen(isOpen)
                            if (!isOpen) {
                                setEditMode(false) // Đặt lại chế độ về thêm mới
                                setInfoFormData({ Name: "", Region: "" })
                                setEditFormData({ Id: -1, Name: "", Region: "" })
                                setOldName("") // Đặt lại tên cũ
                            }
                        }}>
                            <Button 
                            variant="destructive" 
                            disabled={selectedIds.length === 0}
                            onClick={handleDeleteMultiple}
                            >
                                Xóa {selectedIds.length} mục
                            </Button>

                            <DialogTrigger asChild>
                                <Button>Thêm Tỉnh/Thành phố</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? "Sửa Tỉnh/Thành phố" : "Thêm Tỉnh/Thành phố"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="Name">Tên Tỉnh/Thành phố</Label>
                                        <Input
                                            id="Name"
                                            name="Name"
                                            value={editMode ? editFormData.Name : infoFormData.Name}
                                            onChange={handleInfoChange}
                                            required
                                            placeholder="Nhập tên Tỉnh/Thành phố"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="Region">Thuộc Vùng miền</Label>
                                        <Input
                                            id="Region"
                                            name="Region"
                                            value={editMode ? editFormData.Region : infoFormData.Region}
                                            onChange={handleInfoChange}
                                            required
                                            placeholder="Nhập Vùng miền"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setInfoDialogOpen(false)
                                                setEditMode(false)
                                                setInfoFormData({ Name: "", Region: "" })
                                                setEditFormData({ Id: -1, Name: "", Region: "" })
                                                setOldName("")
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                        <Button type="submit">{editMode ? "Cập nhật" : "Thêm Tỉnh/Thành phố"}</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Input 
                                placeholder="Tìm kiếm..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-1/3"
                            />
                            <Button onClick={() => fetchInfo(1)}>Tìm kiếm</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px] text-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                    </TableHead>
                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                    <TableHead className="w-[200px]">Tên</TableHead>
                                    <TableHead className="w-[300px]">Vùng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {infoList.map((item) => (
                                    <TableRow key={item.Id}>
                                        <TableCell>
                                            <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(item.Id)}
                                            onChange={() => handleCheckboxChange(item.Id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick({ Id: item.Id, Name: item.Name, Region: item.Region })}>
                                                    <Pencil className="w-4 h-4 mr-1" /> Sửa
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelClick({ Id: item.Id })}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.Name}</TableCell>
                                        <TableCell>{item.Region}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                    <div className="overflow-x-auto">
                        <Button onClick={() => window.open(`${API.provinces}/export`, "_blank")}>
                            Xuất Excel
                        </Button>
                        <form onSubmit={handleImport}>
                            <Input type="file" name="file" accept=".xlsx" required />
                            <Button type="submit">Import Excel</Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}