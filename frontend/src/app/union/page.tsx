"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnionPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/union/profile");
    }, [router]);

    return null;
}