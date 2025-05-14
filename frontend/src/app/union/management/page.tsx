"use client";

import { useState, useEffect } from "react";
import { UnionTable } from '@/components/unions/UnionTable';
import { userService } from "@/lib/api";
import Cookies from "js-cookie";
import { User } from "@/types/user";

export default function UnionManagementPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const userId = Cookies.get("userId");
        if (userId) {
            userService.getUserById(parseInt(userId))
                .then(response => {
                    setCurrentUser(response.user);
                })
                .catch(error => {
                    console.error("Error fetching user:", error);
                });
        }
    }, []);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">
                Quản lý Hợp tác xã/Quỹ tín dụng  {currentUser?.Province?.Name ? ` ${currentUser.Province.Name}` : ""}
            </h1>
            <UnionTable />
        </div>
    );
}
