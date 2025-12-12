import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL: `${apiUrl}/communities`,
    //  "http://localhost:5000/api/communities",
    headers: { "Content-Type": "application/json" },
});

// 🧠 Add token to every request automatically
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Create new community
export const createCommunity = (data: any) => API.post("/create", data);

// ✅ Get all communities
export const getAllCommunities = () => API.get("/");

// ✅ Get single community by ID
export const getCommunityById = (id: string) => API.get(`/${id}`);

// ✅ Update a community (optional, future use)
export const updateCommunity = (id: string, data: any) =>
    API.patch(`/${id}`, data);

// ✅ Delete a community (optional)
export const deleteCommunity = (id: string) => API.delete(`/${id}`);

// ✅ Join  community by ID
export const joinCommunity = (id: string) => API.post(`/${id}/join`);

// ✅ Join  community by ID
export const leaveCommunity = (id: string) => API.put(`/${id}/leave`);


// ✅ Get all community post by  id
export const getPostById = (id: string) => API.get(`/${id}/post`);

export const deleteAllCommunity = () => API.delete(`/delete-all`);