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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Info = {
    Id: number
    ProvinceId: number
    Name: string
}
type ValuePair = {
    Id: number
    Name: string
}


export default function InfoTablePage() {
    // #region Biến
    const [isImporting, setIsImporting] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchText, setSearchText] = useState("");
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const [currentPage, setCurrentPage] = useState(page);
    const [totalPages, setTotalPages] = useState(1);

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [valuePairList, setValuePairList] = useState<ValuePair[]>([])
    const [oldName, setOldName] = useState("");
    const [infoFormData, setInfoFormData] = useState({
        ProvinceId: -1,
        Name: "",
    });
    const [editFormData, setEditFormData] = useState<Info>({
        Id: -1,
        ProvinceId: -1,
        Name: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [infoList, setInfoList] = useState<Info[]>([])
    // #endregion
    // #region Insert - Edit
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
            if (editFormData.ProvinceId === -1) {
                alert("Vui lòng chọn tỉnh/thành phố.");
                return;
            }
            try {
                const res = await fetch(`${API.wards}/sua`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editFormData),
                });

                if (!res.ok) {
                    const errText = await res.text();
                    alert("Lỗi: " + errText);
                    return;
                }

                console.log("Submitted successfully", editFormData);
                setEditFormData({Id: -1, ProvinceId: -1, Name: ""})
                setEditMode(false)
                fetchInfo(currentPage);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            console.log(infoFormData.ProvinceId)
            if (infoFormData.ProvinceId === -1) {
                alert("Vui lòng chọn tỉnh/thành phố.");
                return;
            }
            try {
                const res = await fetch(API.wards, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(infoFormData),
                });

                if (!res.ok) {
                    const errText = await res.text();
                    alert("Lỗi: " + errText);
                    return;
                }

                console.log("Submitted successfully", infoFormData);
                setInfoFormData({ ProvinceId: -1, Name: ""})
                fetchInfo(currentPage);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
        setInfoDialogOpen(false);
    };
    const commboBoxChange = (value: string) => {
        if (editMode) {
            setEditFormData(prev => ({ ...prev, ProvinceId: parseInt(value) }));
        }
        else {
            setInfoFormData(prev => ({ ...prev, ProvinceId: parseInt(value) }));
        }
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
                const res = await fetch(`${API.wards}`, {
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
        setSelectAll(false);
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
            const res = await fetch(`${API.wards    }`, {
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
          setSelectAll(false);
        } catch (error) {
          console.error("Error deleting multiple:", error);
        }
    };
    // #endregion
    // #region Import Excel
    const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsImporting(true); // Bắt đầu loading
    
        const formData = new FormData(e.currentTarget);
    
        try {
            const res = await fetch(`${API.wards}/import`, {
                method: 'POST',
                body: formData,
            });
    
            const text = await res.text();
            alert(text);
            fetchInfo(currentPage);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi import.");
        } finally {
            setIsImporting(false); // Kết thúc loading
        }
    };
    // #endregion
    const fetchInfo = async (page: number) => {
        try {
            const response = await fetch(`${API.wards}?page=${page}&page_size=${Config.pageSize}&search=${encodeURIComponent(searchText)}`)
            const data = await response.json()
            setInfoList(data.items)
            setTotalPages(Math.ceil(data.total / Config.pageSize))

            const res = await fetch(`${API.wards}/parent_list`)
            const data2 = await res.json()
            setValuePairList(data2)
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }
    useEffect(() => {
        fetchInfo(currentPage)
    }, [currentPage])

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-3xl">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Quản lý Phường/Xã</h2>
                        <Dialog open={infoDialogOpen} onOpenChange={(isOpen) => {
                            setInfoDialogOpen(isOpen)
                            if (!isOpen) {
                                setEditMode(false) // Đặt lại chế độ về thêm mới
                                setInfoFormData({ ProvinceId: -1, Name: "" }) // Đặt lại giá trị form
                                setEditFormData({ Id: -1, ProvinceId: -1, Name: "" }) // Đặt lại giá trị form
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
                                <Button>Thêm Phường/Xã</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? "Sửa Phường/Xã" : "Thêm Phường/Xã"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="ProvinceId">Tỉnh/Thành phố</Label>
                                        <Select
                                            name="ProvinceId"
                                            value={editMode ? String(editFormData.ProvinceId) : (infoFormData.ProvinceId === -1 ? "" : String(infoFormData.ProvinceId))}
                                            onValueChange={(value) => commboBoxChange(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuePairList.map((item) => (
                                                    <SelectItem key={item.Id} value={String(item.Id)}>{item.Name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="Name">Tên Phường/Xã</Label>
                                        <Input
                                            id="Name"
                                            name="Name"
                                            value={editMode ? editFormData.Name : infoFormData.Name}
                                            onChange={handleInfoChange}
                                            required
                                            placeholder="Nhập tên Phường/Xã"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setInfoDialogOpen(false)
                                                setEditMode(false) // Đặt lại chế độ về thêm mới
                                                setInfoFormData({ ProvinceId: -1, Name: "" }) // Đặt lại giá trị form
                                                setEditFormData({ Id: -1, ProvinceId: -1, Name: "" }) // Đặt lại giá trị form
                                                setOldName("") // Đặt lại tên cũ
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                        <Button type="submit">{editMode ? "Cập nhật" : "Thêm Phường/Xã"}</Button>
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
                                    <TableHead className="w-[300px]">Tên Phường/Xã</TableHead>
                                    <TableHead className="w-[200px]">Thuộc Tỉnh/TP</TableHead>
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
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick({ Id: item.Id, ProvinceId: item.ProvinceId, Name: item.Name })}>
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
                                        <TableCell>{valuePairList.find(i => i.Id === item.ProvinceId)?.Name}</TableCell>
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
                    <div className="overflow-x-auto space-y-2">
                        <Button onClick={() => window.open(`${API.wards}/export`, "_blank")}>
                            Xuất Excel
                        </Button>

                        <form onSubmit={handleImport} className="flex items-center gap-2">
                            <Input type="file" name="file" accept=".xlsx" required disabled={isImporting} />
                            <Button type="submit" disabled={isImporting}>
                                {isImporting ? "Đang import..." : "Import Excel"}
                            </Button>
                            {isImporting && <span className="text-blue-500 text-sm animate-pulse">Đang xử lý...</span>}
                        </form>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}