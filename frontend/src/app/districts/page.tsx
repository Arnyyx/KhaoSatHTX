"use client"

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
  ProvinceId: number
  Name: string
}
type ValuePair = {
  Id: number
  Name: string
}

export default function InfoTablePage() {
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [valuePairList, setValuePairList] = useState<ValuePair[]>([])
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
                const res = await fetch("http://localhost:5000/districts/sua", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editFormData),
                });
        
                if (!res.ok) {
                    throw new Error("Failed to submit");
                }
        
                console.log("Submitted successfully", infoFormData);
                window.location.reload();
                setEditFormData({Id: -1, ProvinceId: -1, Name: ""});
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            try {
                const res = await fetch("http://localhost:5000/districts", {
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
                setInfoFormData({ProvinceId: -1, Name: ""});
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
        setEditFormData(data); // Truyền thông tin vào form
        setEditMode(true); // Chế độ sửa
        setInfoDialogOpen(true); // Mở Dialog
    };
    const handleDelClick = async (data: {Id: number}) => {
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if (isConfirmed) {
            try {
                const res = await fetch("http://localhost:5000/districts", {
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
                const response = await fetch("http://localhost:5000/districts")
                const data = await response.json()
                setInfoList(data)
                const res = await fetch("http://localhost:5000/districts/parent_list")
                const data2 = await res.json()
                setValuePairList(data2)
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchInfo()
    }, [])

    // if (infoList.length === 0) {
    //     setInfoList([{Id: -1, ProvinceId: -1, Name: ""}]);
    // }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-3xl">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Quản lý Quận/Huyện</h2>
                        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Thêm Quận/Huyện</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? "Sửa Quận/Huyện" : "Thêm Quận/Huyện"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="ProvinceId">Tỉnh/Thành phố</Label>
                                        <Select
                                            name="ProvinceId"
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
                                        <Label htmlFor="Name">Tên Quận/Huyện</Label>
                                        <Input
                                            id="Name"
                                            name="Name"
                                            value={editMode ? editFormData.Name : infoFormData.Name}
                                            onChange={handleInfoChange}
                                            required
                                            placeholder="Nhập Vùng miền"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setInfoDialogOpen(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button type="submit">{editMode ? "Cập nhật" : "Thêm Quận/Huyện"}</Button>
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
                                    <TableHead className="w-[300px]">Tên Quận/Huyện</TableHead>
                                    <TableHead className="w-[200px]">Thuộc</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {infoList.map((item) => (
                                    <TableRow key={item.Id}>
                                        <TableCell>
                                            <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick({ Id: item.Id, ProvinceId: item.ProvinceId, Name: item.Name })}>
                                                    <Pencil className="w-4 h-4 mr-1"/> Sửa
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelClick({Id: item.Id})}
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