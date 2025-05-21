// lib/api.ts
import axios from "axios";
import { Province, UserResponse, Ward } from "@/types/user";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const initialPage = 1
const initialLimit = 10
const initialSearch = ""
const initialSortColumn = "Username"
const initialSortDirection = "ASC"

export const API = {
    surveys: `${BASE_URL}/surveys`,
    questions: `${BASE_URL}/questions`,
    users: `${BASE_URL}/users`,
    profile: `${BASE_URL}/profile`,
    provinces: `${BASE_URL}/provinces`,
    districts: `${BASE_URL}/districts`,
    wards: `${BASE_URL}/wards`,
    result: `${BASE_URL}/results`,
}

export const surveyService = {
    getSurveysByPage: async (page: number = initialPage, limit: number = initialLimit, search: string = "") => {
        const response = await axios.get(
            `${BASE_URL}/surveys?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`
        );
        return response.data;
    },

    getSurveys: async () => {
        const response = await axios.get(`${BASE_URL}/surveys`);
        return response.data;
    },

    createSurvey: async (data: any) => {
        const response = await axios.post(`${BASE_URL}/surveys`, data);
        return response.data;
    },

    updateSurvey: async (id: number, data: any) => {
        const response = await axios.put(`${BASE_URL}/surveys/${id}`, data);
        return response.data;
    },

    deleteSurvey: async (id: number) => {
        const response = await axios.delete(`${BASE_URL}/surveys/${id}`);
        return response.data;
    },

    deleteMultipleSurveys: async (ids: number[]) => {
        const response = await axios.delete(`${BASE_URL}/surveys`, { data: { ids } });
        return response.data;
    },

    getQuestions: async (surveyId: number, page: number = initialPage, limit: number = initialLimit) => {
        const response = await axios.get(
            `${BASE_URL}/questions/by-survey?surveyId=${surveyId}&page=${page}&limit=${limit}`
        );
        return response.data;
    },

    createQuestion: async (data: any) => {
        const response = await axios.post(`${BASE_URL}/questions`, data);
        return response.data;
    },

    updateQuestion: async (id: number, data: any) => {
        const response = await axios.put(`${BASE_URL}/questions/${id}`, data);
        return response.data;
    },

    deleteQuestion: async (id: number) => {
        const response = await axios.delete(`${BASE_URL}/questions/${id}`);
        return response.data;
    },
};

export const userService = {
    getUsers: async (page: number = initialPage, limit: number = initialLimit, search: string = initialSearch, sortColumn: string = initialSortColumn, sortDirection: string = initialSortDirection, filters?: Record<string, any>): Promise<UserResponse> => {
        let url = `${BASE_URL}/users?page=${page}&limit=${limit}&sortColumn=${sortColumn}&sortDirection=${sortDirection}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    url += `&${key}=${encodeURIComponent(value)}`;
                }
            });
        }

        const response = await axios.get(url);
        return response.data;
    },

    checkUsername: async (username: string): Promise<{ exists: boolean }> => {
        const response = await axios.get(`${BASE_URL}/users/check-username?username=${encodeURIComponent(username)}`);
        return response.data;
    },

    getUsersByProvince: async (provinceId: number, page: number = initialPage, limit: number = initialLimit,
        search: string = initialSearch, sortColumn: string = initialSortColumn, sortDirection: string = initialSortDirection, filters?: Record<string, any>): Promise<UserResponse> => {
        let url = `${BASE_URL}/users/province?provinceId=${provinceId}&page=${page}&limit=${limit}&sortColumn=${sortColumn}&sortDirection=${sortDirection}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

        // Add filter parameters if provided
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    url += `&${key}=${encodeURIComponent(value)}`;
                }
            });
        }

        const response = await axios.get(url);
        return response.data;
    },

    getUserById: async (id: number) => {
        const response = await axios.get(`${BASE_URL}/users/${id}`);
        return response.data;
    },

    createUser: async (data: any) => {
        const response = await axios.post(`${BASE_URL}/users`, data);
        return response.data;
    },

    updateUser: async (id: number, data: any) => {
        const response = await axios.put(`${BASE_URL}/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await axios.delete(`${BASE_URL}/users/${id}`);
        return response.data;
    },
    deleteMultipleUsers: async (ids: number[]) => {
        const response = await axios.delete(`${BASE_URL}/users/bulk`, { data: { ids } });
        return response.data;
    },
    importUsers: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const userId = Cookies.get('ID_user');
            if (userId) {
                formData.append("userId", userId);
            }

            const response = await axios.post(`${BASE_URL}/users/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("API importUsers error:", error.response?.data || error.message);
            throw error;
        }
    },
    exportUsers: async (ids: number[]) => {
        const response = await axios.post(
            `${BASE_URL}/users/export`,
            { ids: ids.join(",") },
            {
                responseType: "blob",
            }
        );
        return response;
    },

};

export const provinceService = {
    getProvinces: async (): Promise<{ total: number; items: Province[] }> => {
        const response = await axios.get(`${BASE_URL}/provinces`);
        return response.data;
    },
};

export const wardService = {
    getWards: async (): Promise<{ total: number; items: Ward[] }> => {
        const response = await axios.get(`${BASE_URL}/wards`);
        return response.data;
    },
    getWardsByProvinceId: async (provinceId: number): Promise<{ total: number; items: Ward[] }> => {
        const response = await axios.get(`${BASE_URL}/wards/province/${provinceId}`);
        return response.data;
    },
};