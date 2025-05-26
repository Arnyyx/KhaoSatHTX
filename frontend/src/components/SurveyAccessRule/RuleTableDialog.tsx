"use client";

import { useState, useEffect } from "react";
import { surveyService } from "@/lib/api";
import { Pencil, Trash2, BarChart2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { API } from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SurveyAccessRule {
    Id: number;
    SurveyId: number;
    Role: string;
    Type: string;
}
interface SurveyFormProps {
    SurveyId: number;
}

export function RuleTableDialog({SurveyId}: SurveyFormProps) {
    const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [accessRule, setAccessRule] = useState<SurveyAccessRule[]>([]);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [ruleFormData, setRuleFormData] = useState<SurveyAccessRule>({
        Id: -1,
        SurveyId: -1,
        Role: "",
        Type: "",
    });
    const handleEditClick = (data: SurveyAccessRule) => {
        setRuleFormData(data); // Truyền thông tin vào form
        setEditMode(true); // Chế độ sửa
        setInfoDialogOpen(true); // Mở Dialog
    };
    const commboBoxChange = (name: string, value: string) => {
        if(!editMode) setRuleFormData(prev => ({ ...prev, Id: 1 }));
        setRuleFormData(prev => ({ ...prev, SurveyId: SurveyId}))
        setRuleFormData(prev => ({ ...prev, [name]: value }));
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
            const allIds = accessRule.map(item => item.Id);
            setSelectedIds(allIds);
        }
        setSelectAll(!selectAll);
    };
    const handleDelClick = async (data: { Id: number }) => {
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if (isConfirmed) {
            try {
                setSelectedIds([data.Id])
                const res = await fetch(`${API.surveys}/access_rule/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: [data.Id] }),
                });
                if (!res.ok) throw new Error("Delete failed");
                setSelectedIds([]);
                await fetchInfo();
                setSelectAll(false);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        } else {
            console.log('Hủy');
        }
    };
    const handleDeleteMultiple = async () => {
        const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mục?`);
        if (!isConfirmed) return;

        try {
            const res = await fetch(`${API.surveys}/access_rule/`, {
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
            await fetchInfo();
            setSelectAll(false);
        } catch (error) {
            console.error("Error deleting multiple:", error);
        }
    };
    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (ruleFormData.Role === "") {
            alert("Vui lòng chọn Vai trò.");
            return;
        }
        if (ruleFormData.Type === "") {
            alert("Vui lòng chọn Loại.");
            return;
        }
        try {
            console.log('submitdata',ruleFormData)
            const res = await fetch(`${API.surveys}/access_rule/${editMode ? "sua" : "them"}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ruleFormData),
            });

            if (!res.ok) {
                const errText = await res.text();
                alert("Lỗi: " + errText);
                return;
            }

            console.log("Submitted successfully", ruleFormData);
            setRuleFormData({ Id: -1, SurveyId: -1, Role: "", Type: "",});
            await fetchInfo();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
        setInfoDialogOpen(false);
    };
    const fetchInfo = async () => {
        try {
            const initialData = await surveyService.getAccessRules(SurveyId);
            setAccessRule(initialData);
        } catch (error: any) {
            toast.error("Lỗi khi lấy danh sách rule", {
                description: error.message,
            });
        }
    };
    useEffect(() => {
        fetchInfo();
    }, [accessRule]);
    return (
        <Dialog open={ruleDialogOpen} onOpenChange={(isOpen) => {
            setRuleDialogOpen(isOpen)
        }}>
            <DialogTrigger asChild>
                <Button>Sửa Quyền</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Truy cập</DialogTitle>
                </DialogHeader>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Quản lý Quyền</h2>
                    <Dialog open={infoDialogOpen} onOpenChange={(isOpen) => {
                        setInfoDialogOpen(isOpen)
                        if (!isOpen) {
                            setEditMode(false);
                            setRuleFormData({ Id: -1, SurveyId: -1, Role: "", Type: "", });
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
                            <Button>Thêm</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{editMode ? "Sửa" : "Thêm"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleInfoSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="Role">Vai trò</Label>
                                    <Select
                                        name="Role"
                                        value={String(ruleFormData.Role)}
                                        onValueChange={(value) => commboBoxChange("Role", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HTX">HTX</SelectItem>
                                            <SelectItem value="QTD">QTD</SelectItem>
                                            <SelectItem value="LMHTX">LMHTX</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="Type">Loại</Label>
                                    <Select
                                        name="Type"
                                        value={String(ruleFormData.Type)}
                                        onValueChange={(value) => commboBoxChange("Type", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NN">NN</SelectItem>
                                            <SelectItem value="PNN">PNN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setInfoDialogOpen(false)
                                            setRuleFormData({ Id: -1, SurveyId: -1, Role: "", Type: "", });
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit">Cập nhật</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                            <TableHead className="w-[150px]">Hành động</TableHead>
                            <TableHead className="w-[50px]">Vai trò</TableHead>
                            <TableHead className="w-[50px]">Loại</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accessRule.map((item) => (
                            item.SurveyId === SurveyId ?
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
                                        <Button variant="outline" size="sm" onClick={() => handleEditClick({ Id: item.Id, SurveyId: item.SurveyId, Role: item.Role, Type: item.Type })}>
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
                                <TableCell>{item.Role}</TableCell>
                                <TableCell>{item.Type}</TableCell>
                            </TableRow>
                            : ''
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
}

                