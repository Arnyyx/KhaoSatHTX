import { API } from "@/lib/api";

export const logout = async () => {
    try {
        const response = await fetch(`${API.users}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, message: 'Lỗi khi đăng xuất' };
    }
};