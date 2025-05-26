"use client";

import { useState } from "react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function Home() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Chọn ngày và giờ</h1>
            <DateTimePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
            />
            {selectedDate && (
                <p className="mt-4">
                    Ngày được chọn: {format(selectedDate, "HH:mm dd/MM/yyyy", { locale: vi })}
                </p>
            )}
        </div>
    );
}