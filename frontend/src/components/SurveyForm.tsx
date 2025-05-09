"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isValid, addMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface SurveyFormProps {
    initialData?: {
        Id?: number;
        Title: string;
        Description: string;
        StartTime: string;
        EndTime: string;
        Status: boolean;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function SurveyForm({ initialData, onSubmit, onCancel }: SurveyFormProps) {
    const [formData, setFormData] = useState({
        Title: initialData?.Title || "",
        Description: initialData?.Description || "",
        StartTime: initialData?.StartTime
            ? isValid(parseISO(initialData.StartTime))
                ? parseISO(initialData.StartTime)
                : new Date()
            : new Date(),
        EndTime: initialData?.EndTime
            ? isValid(parseISO(initialData.EndTime))
                ? parseISO(initialData.EndTime)
                : addMinutes(new Date(), 60)
            : addMinutes(new Date(), 60),
        Status: initialData?.Status || true,
    });

    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.EndTime <= formData.StartTime) {
            alert("End Time must be after Start Time");
            return;
        }
        onSubmit({
            ...formData,
            StartTime: format(formData.StartTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
            EndTime: format(formData.EndTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        });
    };

    const handleTimeChange = (
        field: "StartTime" | "EndTime",
        value: string,
        type: "hour" | "minute"
    ) => {
        const newDate = new Date(formData[field]);
        if (type === "hour") {
            newDate.setHours(parseInt(value));
        } else {
            newDate.setMinutes(parseInt(value));
        }
        setFormData({ ...formData, [field]: newDate });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    placeholder="Enter survey title"
                />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={formData.Description}
                    onChange={(e) =>
                        setFormData({ ...formData, Description: e.target.value })
                    }
                    placeholder="Enter survey description"
                />
            </div>

            <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Popover open={openStart} onOpenChange={setOpenStart}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.StartTime, "PPP HH:mm")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.StartTime}
                            onSelect={(date) =>
                                date &&
                                setFormData({
                                    ...formData,
                                    StartTime: new Date(
                                        date.setHours(
                                            formData.StartTime.getHours(),
                                            formData.StartTime.getMinutes()
                                        )
                                    ),
                                })
                            }
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                        />
                        <div className="flex space-x-2 p-2">
                            <select
                                value={formData.StartTime.getHours().toString().padStart(2, "0")}
                                onChange={(e) => handleTimeChange("StartTime", e.target.value, "hour")}
                                className="rounded-md border p-2"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={formData.StartTime.getMinutes().toString().padStart(2, "0")}
                                onChange={(e) => handleTimeChange("StartTime", e.target.value, "minute")}
                                className="rounded-md border p-2"
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div>
                <Label htmlFor="endTime">End Time</Label>
                <Popover open={openEnd} onOpenChange={setOpenEnd}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.EndTime, "PPP HH:mm")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.EndTime}
                            onSelect={(date) =>
                                date &&
                                setFormData({
                                    ...formData,
                                    EndTime: new Date(
                                        date.setHours(
                                            formData.EndTime.getHours(),
                                            formData.EndTime.getMinutes()
                                        )
                                    ),
                                })
                            }
                            disabled={(date) => date < formData.StartTime}
                            initialFocus
                        />
                        <div className="flex space-x-2 p-2">
                            <select
                                value={formData.EndTime.getHours().toString().padStart(2, "0")}
                                onChange={(e) => handleTimeChange("EndTime", e.target.value, "hour")}
                                className="rounded-md border p-2"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={formData.EndTime.getMinutes().toString().padStart(2, "0")}
                                onChange={(e) => handleTimeChange("EndTime", e.target.value, "minute")}
                                className="rounded-md border p-2"
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="status"
                    checked={formData.Status}
                    onCheckedChange={(checked) =>
                        setFormData({ ...formData, Status: checked })
                    }
                />
                <Label htmlFor="status">Active Status</Label>
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{initialData?.Id ? "Update" : "Create"}</Button>
            </div>
        </form>
    );
}