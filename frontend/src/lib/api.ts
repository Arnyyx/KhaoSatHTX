// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const API = {
    surveys: `${BASE_URL}/surveys`,
    users: `${BASE_URL}/users`,
    provinces: `${BASE_URL}/provinces`,
    districts: `${BASE_URL}/districts`,
    wards: `${BASE_URL}/wards`
    // thêm endpoint khác nếu cần
}
