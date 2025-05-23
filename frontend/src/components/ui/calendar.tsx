"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { vi } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, getYear, setYear, getMonth, setMonth } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Custom navigation component to replace the default caption
  const CustomCaption = React.useCallback(({ 
    displayMonth,
    goToMonth,
  }: {
    displayMonth: Date;
    goToMonth: (date: Date) => void;
  }) => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    // Optimize year range to reduce lag
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();

    const handleYearChange = (year: string) => {
      const newDate = setYear(displayMonth, parseInt(year));
      goToMonth(newDate);
    };

    const handleMonthChange = (monthIndex: string) => {
      const newDate = setMonth(displayMonth, parseInt(monthIndex));
      goToMonth(newDate);
    };

    return (
      <div className="flex justify-center items-center gap-2 mb-2">
        <Select
          value={getMonth(displayMonth).toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="h-9 w-[120px] border-0 shadow-sm font-medium text-sm rounded-md">
            <SelectValue />
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
          value={getYear(displayMonth).toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="h-9 w-[90px] border-0 shadow-sm font-medium text-sm rounded-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }, []);

  return (
    <DayPicker
      locale={vi}
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white border border-input rounded-md shadow-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 border-0 shadow-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        ),
        nav_button_previous: "absolute left-2 top-2",
        nav_button_next: "absolute right-2 top-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem] text-center",
        row: "flex w-full mt-1",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "bg-accent/50 text-accent-foreground font-bold",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiersClassNames={{
        today: "bg-accent/50 font-bold",
        selected: "bg-primary text-primary-foreground rounded-full"
      }}
      onMonthChange={props.onMonthChange}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    >
      <div className="rdp-caption_start">
        {CustomCaption({ 
          displayMonth: props.month || new Date(), 
          goToMonth: (date) => props.onMonthChange?.(date)
        })}
      </div>
    </DayPicker>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
