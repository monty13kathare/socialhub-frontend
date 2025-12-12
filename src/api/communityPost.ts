import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL:  `${apiUrl}/community/post`,
    // "http://localhost:5000/api/community/post",
    headers: { "Content-Type": "multipart/form-data" },

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
export const createCommunityPost = (data: any) => API.post("/", data);

