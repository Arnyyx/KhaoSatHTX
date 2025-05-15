"use client"

import * as React from "react"
import { format, getYear, getMonth } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  placeholder = "Chọn ngày",
}: DatePickerProps) {
  const [month, setMonth] = React.useState<Date>(date || new Date());

  // Generate years array (100 years in the past, 50 years in the future)
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    return Array.from(
      { length: 150 },
      (_, i) => currentYear - 100 + i
    );
  }, [currentYear]);

  // Generate months array
  const months = React.useMemo(() => [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ], []);

  // Update month when date changes
  React.useEffect(() => {
    if (date) {
      setMonth(date);
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: vi }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-2 p-3 border-b">
          <Select
            value={getMonth(month).toString()}
            onValueChange={(value) => {
              const newMonth = new Date(month);
              newMonth.setMonth(parseInt(value));
              setMonth(newMonth);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((monthName, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={getYear(month).toString()}
            onValueChange={(value) => {
              const newMonth = new Date(month);
              newMonth.setFullYear(parseInt(value));
              setMonth(newMonth);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          locale={vi}
          month={month}
          onMonthChange={setMonth}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 