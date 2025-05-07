// lib/api.ts

import { profile } from "console"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const API = {
    surveys: `${BASE_URL}/surveys`,
    users: `${BASE_URL}/users`,
    profile: `${BASE_URL}/profile`,
    // thêm endpoint khác nếu cần
}
