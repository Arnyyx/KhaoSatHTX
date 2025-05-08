// login.ts

import { API } from "@/lib/api"
export const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API.users}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      const result = await res.json();
      return result; // ⚠️ phải trả về toàn bộ JSON gốc
    } catch (err) {
      console.error("Lỗi khi gọi API login:", err);
      return { success: false, message: "Lỗi kết nối đến máy chủ." };
    }
  };