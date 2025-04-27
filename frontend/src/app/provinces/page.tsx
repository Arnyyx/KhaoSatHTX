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
type Info = {
  Id: number
  Name: string
  Region: string
}

export default function InfoTablePage() {
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
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
                const res = await fetch("http://localhost:5000/provinces/sua", {
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
                setEditFormData({Id: -1, Name: "", Region: "" });
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            try {
                const res = await fetch("http://localhost:5000/provinces", {
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
                setInfoFormData({ Name: "", Region: "" });
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
        setInfoDialogOpen(false);
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
                const res = await fetch("http://localhost:5000/provinces", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
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
                const response = await fetch("./api/provinces")
                const data = await response.json()
                console.log(data)
                setInfoList(data)
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchInfo()
    }, [])

    if (infoList.length === 0) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p>Đang tải dữ liệu...</p>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-3xl">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Quản lý Tỉnh/Thành phố</h2>
                        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Thêm Tỉnh/Thành phố</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? "Sửa Tỉnh/Thành phố" : "Thêm Tỉnh/Thành phố"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="prname">Tên Tỉnh/Thành phố</Label>
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
                                        <Label htmlFor="region">Vùng miền</Label>
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
                                            onClick={() => setInfoDialogOpen(false)}
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Hành động</TableHead>
                                    <TableHead className="w-[200px]">Tên</TableHead>
                                    <TableHead className="w-[300px]">Vùng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {infoList.map((item) => (
                                    <TableRow key={item.Id}>
                                        <TableCell>
                                            <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick({ Id: item.Id, Name: item.Name, Region: item.Region })}>
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
                                        <TableCell>{item.Region}</TableCell>
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