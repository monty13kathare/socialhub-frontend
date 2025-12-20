import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL: `${apiUrl}/chat`,
     withCredentials: true,
});

// 🧠 Add token to every request automatically
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export const createConversation = (userId: string) => {
  return API.post("/conversations", { userId });
};

export const getMessages = (conversationId: string) =>
  API.get(`/messages/${conversationId}`);

export const sendMessageAPI = (conversationId: string, content: string, type: string = "text") => {
  return API.post("/sendMessage", { conversationId, content, type });
};