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
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldPath, Controller } from "react-hook-form";

type FormValues = {
  [key: string]: any;
};

interface DatePickerProps<T extends FormValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  showTimePicker?: boolean;
}

export function DatePicker<T extends FormValues>({
  control,
  name,
  label,
  showTimePicker = true,
}: DatePickerProps<T>) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>
                    {field.value instanceof Date && !isNaN(field.value.getTime())
                      ? format(
                        field.value,
                        showTimePicker ? "PPP HH:mm" : "PPP",
                        { locale: vi }
                      )
                      : showTimePicker
                        ? "Chọn ngày và giờ"
                        : "Chọn ngày"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={field.value instanceof Date ? field.value : undefined}
                    onSelect={(date) => {
                      console.log(date);
                      if (!date) return;
                      const newDate = new Date(date);
                      if (field.value instanceof Date && showTimePicker) {
                        newDate.setHours(
                          field.value.getHours(),
                          field.value.getMinutes()
                        );
                      } else {
                        newDate.setHours(0, 0, 0, 0);
                      }
                      field.onChange(newDate);
                    }}
                    initialFocus
                  />
                  {showTimePicker && (
                    <div className="flex space-x-2 pt-2">
                      <Select
                        value={
                          field.value instanceof Date
                            ? field.value.getHours().toString()
                            : "0"
                        }
                        onValueChange={(value) => {
                          const newDate = field.value instanceof Date
                            ? new Date(field.value)
                            : new Date();
                          newDate.setHours(parseInt(value));
                          field.onChange(newDate);
                        }}
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
                        value={
                          field.value instanceof Date
                            ? field.value.getMinutes().toString()
                            : "0"
                        }
                        onValueChange={(value) => {
                          const newDate = field.value instanceof Date
                            ? new Date(field.value)
                            : new Date();
                          newDate.setMinutes(parseInt(value));
                          field.onChange(newDate);
                        }}
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
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </FormControl>
        )}
      />
      <FormMessage />
    </FormItem>
  );
}