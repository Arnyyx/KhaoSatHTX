"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FilterDatePickerProps {
    date: Date | undefined;
    onSelect: (date: Date | null) => void;
    placeholder?: string;
}

export function FilterDatePicker({ date, onSelect, placeholder = "Chọn ngày và giờ" }: FilterDatePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    React.useEffect(() => {
        setSelectedDate(date);
    }, [date]);

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) {
            setSelectedDate(undefined);
            onSelect(null);
            return;
        }
        const updatedDate = new Date(newDate);
        updatedDate.setHours(selectedDate?.getHours() || 0, selectedDate?.getMinutes() || 0);
        setSelectedDate(updatedDate);
        onSelect(updatedDate);
    };

    const handleHourChange = (value: string) => {
        const newDate = new Date(selectedDate || new Date());
        newDate.setHours(parseInt(value));
        setSelectedDate(newDate);
        onSelect(newDate);
    };

    const handleMinuteChange = (value: string) => {
        const newDate = new Date(selectedDate || new Date());
        newDate.setMinutes(parseInt(value));
        setSelectedDate(newDate);
        onSelect(newDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                        {selectedDate
                            ? format(selectedDate, "HH:mm dd/MM/yyyy", { locale: vi })
                            : placeholder}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="p-3">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="flex space-x-2 pt-2">
                        <Select
                            value={selectedDate?.getHours()?.toString() || "0"}
                            onValueChange={handleHourChange}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Giờ" />
                            </SelectTrigger>
                            <SelectContent>
                                {hours.map((hour) => (
                                    <SelectItem key={hour} value={hour.toString()}>
                                        {hour.toString().padStart(2, "0")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedDate?.getMinutes()?.toString() || "0"}
                            onValueChange={handleMinuteChange}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Phút" />
                            </SelectTrigger>
                            <SelectContent>
                                {minutes.map((minute) => (
                                    <SelectItem key={minute} value={minute.toString()}>
                                        {minute.toString().padStart(2, "0")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}