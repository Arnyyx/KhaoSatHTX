// lib/api.ts
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const API = {
    surveys: `${BASE_URL}/surveys`,
    questions: `${BASE_URL}/questions`,
    users: `${BASE_URL}/users`,
    provinces: `${BASE_URL}/provinces`,
    districts: `${BASE_URL}/districts`,
    wards: `${BASE_URL}/wards`,
}

export const surveyService = {
    getSurveys: async (page: number = 1, limit: number = 10, search: string = "") => {
        const response = await axios.get(
            `${BASE_URL}/surveys?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`
        );
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

    getQuestions: async (surveyId: number, page: number = 1, limit: number = 10) => {
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

