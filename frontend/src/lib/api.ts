// lib/api.ts
import axios from "axios";
import { Province, Ward } from "@/types/user";

import { profile } from "console"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const initialPage = 1
const initialLimit = 10

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
    getUsers: async (page: number = initialPage, limit: number = initialLimit, search: string = "", sortColumn: string = "Username", sortDirection: string = "ASC") => {
        const response = await axios.get(`${BASE_URL}/users?page=${page}&limit=${limit}&sortColumn=${sortColumn}&sortDirection=${sortDirection}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
        return response.data;
    },

    getUsersByRoleAndProvince: async (role: string, provinceId: number) => {
        const response = await axios.get(`${BASE_URL}/users/role-province?role=${role}&provinceId=${provinceId}`);
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
        const response = await axios.delete(`${BASE_URL}/users`, { data: { ids } });
        return response.data;
    },
    importUsers: async (file: File) => {
        const response = await axios.post(`${BASE_URL}/users/import`, { file });
        return response.data;
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