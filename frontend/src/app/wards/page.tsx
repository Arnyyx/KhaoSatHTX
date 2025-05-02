"use client"

import { API } from "@/lib/api"
import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, BarChart2 } from "lucide-react";
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
    DistrictId: number
    Name: string
}
type ValuePair = {
    Id: number
    Name: string
}

export default function InfoTablePage() {
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [valuePairList, setValuePairList] = useState<ValuePair[]>([])
    const [oldName, setOldName] = useState("");
    const [infoFormData, setInfoFormData] = useState({
        DistrictId: -1,
        Name: "",
    });
    const [editFormData, setEditFormData] = useState<Info>({
        Id: -1,
        DistrictId: -1,
        Name: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [infoList, setInfoList] = useState<Info[]>([])

    const isNameDuplicate = (name: string): boolean => {
        return infoList.some(item => item.Name.toLowerCase().trim() === name.toLowerCase().trim());
    };

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
            if (isNameDuplicate(editFormData.Name) && editFormData.Name !== oldName) {
                alert("Tên phường/xã đã tồn tại. Vui lòng nhập tên khác.");
                return;
            }
            if (editFormData.DistrictId === -1) {
                alert("Vui lòng chọn quận/huyện.");
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
                    throw new Error("Failed to submit");
                }

                console.log("Submitted successfully", editFormData);
                window.location.reload();
                setEditFormData({ Id: -1, DistrictId: -1, Name: "" });
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            if (isNameDuplicate(infoFormData.Name)) {
                alert("Tên phường/xã đã tồn tại. Vui lòng nhập tên khác.");
                return;
            }
            if (infoFormData.DistrictId === -1) {
                alert("Vui lòng chọn quận/huyện.");
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
                    throw new Error("Failed to submit");
                }

                console.log("Submitted successfully", infoFormData);
                window.location.reload();
                setInfoFormData({ DistrictId: -1, Name: "" });
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
        setInfoDialogOpen(false);
    };
    const commboBoxChange = (value: string) => {
        if (editMode) {
            setEditFormData(prev => ({ ...prev, DistrictId: parseInt(value) }));
        }
        else {
            setInfoFormData(prev => ({ ...prev, DistrictId: parseInt(value) }));
        }
    };
    const handleEditClick = (data: Info) => {
        setOldName(data.Name); // Lưu tên cũ để so sánh
        setEditFormData(data); // Truyền thông tin vào form
        setEditMode(true); // Chế độ sửa
        setInfoDialogOpen(true); // Mở Dialog
    };
    const handleDelClick = async (data: { Id: number }) => {
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if (isConfirmed) {
            try {
                const res = await fetch(API.wards, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                window.location.reload();
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            console.log('Hủy');
        }
    };
    useEffect(() => {
        // Gọi API từ backend Next.js
        async function fetchInfo() {
            try {
                const response = await fetch(API.wards)
                const data = await response.json()
                setInfoList(data)
                const res = await fetch(`${API.districts}/parent_list`)
                const data2 = await res.json()
                setValuePairList(data2)
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchInfo()
    }, [])

    // if (infoList.length === 0) {
    //     setInfoList([{Id: -1, DistrictId: -1, Name: ""}]);
    // }

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
                                setInfoFormData({ DistrictId: -1, Name: "" }) // Đặt lại giá trị form
                                setEditFormData({ Id: -1, DistrictId: -1, Name: "" }) // Đặt lại giá trị form
                                setOldName("") // Đặt lại tên cũ
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>Thêm Phường/Xã</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? "Sửa Phường/Xã" : "Thêm Phường/Xã"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="DistrictId">Quận/Huyện</Label>
                                        <Select
                                            name="DistrictId"
                                            onValueChange={(value) => commboBoxChange(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn Quận/Huyện" />
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
                                                setInfoFormData({ DistrictId: -1, Name: "" }) // Đặt lại giá trị form
                                                setEditFormData({ Id: -1, DistrictId: -1, Name: "" }) // Đặt lại giá trị form
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                    <TableHead className="w-[300px]">Tên Phường/Xã</TableHead>
                                    <TableHead className="w-[200px]">Thuộc Quận/Huyện</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {infoList.map((item) => (
                                    <TableRow key={item.Id}>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick({ Id: item.Id, DistrictId: item.DistrictId, Name: item.Name })}>
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
                                        <TableCell>{valuePairList.find(item => item.Id === item.Id)?.Name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}