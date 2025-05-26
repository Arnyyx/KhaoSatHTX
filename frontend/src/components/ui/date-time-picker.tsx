import * as React from "react";
import { format, parse } from "date-fns";
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

interface DateTimePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    disabled?: boolean;
}

export function DateTimePicker({
    value,
    onChange,
    disabled,
}: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value);
    const [time, setTime] = React.useState<string>(
        value ? format(value, "HH:mm") : "00:00"
    );

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setDate(undefined);
            onChange?.(undefined);
            return;
        }

        const newDate = new Date(selectedDate);
        const [hour, minute] = time.split(":");
        newDate.setHours(parseInt(hour), parseInt(minute));
        setDate(newDate);
        onChange?.(newDate);
    };

    const handleTimeChange = (type: "hour" | "minute", value: string) => {
        const [currentHour, currentMinute] = time.split(":");
        const newTime = type === "hour" ? `${value}:${currentMinute}` : `${currentHour}:${value}`;
        setTime(newTime);

        if (date) {
            const newDate = new Date(date);
            const [hour, minute] = newTime.split(":");
            newDate.setHours(parseInt(hour), parseInt(minute));
            setDate(newDate);
            onChange?.(newDate);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "HH:mm dd/MM/yyyy", { locale: vi }) : "Chọn ngày và giờ"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    locale={vi}
                    initialFocus
                />
                <div className="p-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                        <Select
                            value={time.split(":")[0]}
                            onValueChange={(value) => handleTimeChange("hour", value)}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Giờ" />
                            </SelectTrigger>
                            <SelectContent>
                                {hours.map((hour) => (
                                    <SelectItem key={hour} value={hour}>
                                        {hour}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={time.split(":")[1]}
                            onValueChange={(value) => handleTimeChange("minute", value)}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Phút" />
                            </SelectTrigger>
                            <SelectContent>
                                {minutes.map((minute) => (
                                    <SelectItem key={minute} value={minute}>
                                        {minute}
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