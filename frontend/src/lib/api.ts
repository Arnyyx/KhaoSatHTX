// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const API = {
    surveys: `${BASE_URL}/surveys`,
    users: `${BASE_URL}/users`,
    // thêm endpoint khác nếu cần
}
