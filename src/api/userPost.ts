import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL: `${apiUrl}/posts`,
    headers: { "Content-Type": "multipart/form-data" },

});

const BASE_API = axios.create({
    baseURL: `${apiUrl}/posts`,
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

BASE_API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Create new community
export const createUserPost = (data: any) => API.post("/", data);

// 📜 Get all posts
export const getAllPosts = (limit:any, cursor:any) =>
  API.get("/", {
    params: { limit, cursor },
  });

// 👤 Get posts by a specific user
export const getUserPosts = (userId: string) => API.get(`/user/${userId}`);



// ✏️ Update a post (supports multiple images)
export const updatePost = (postId: string, data: any) =>
    API.put(`/${postId}`, data);

// 🗑️ Delete a post
export const deletePost = (postId: string) => API.delete(`/${postId}`);

// Post LIke /UnLike
export const toggleLike = (postId: string) =>
    BASE_API.put(`/${postId}/like`);

export const sharePost = (postId: string) =>
    API.post(`/${postId}/share`);

export const deleteAllPosts = () =>
    API.delete(`/delete-all`);


export const getPostById = (postId: string) =>
    BASE_API.get(`/${postId}`);





//------------------------------------ Comment Api------------------------------------



export const addComment = (postId: string, text: string) =>
    BASE_API.post(`/${postId}/comment`, { text });

export const deleteComment = (postId: string, commentId: string) =>
    BASE_API.delete(`/${postId}/comment/${commentId}`);



export const addReply = (postId: string, commentId: string, text: string) =>
  BASE_API.post(`/${postId}/comments/${commentId}/reply`,  { text: text.trim() });

export const deleteReply = (postId: string, commentId: string) =>
    BASE_API.delete(`/${postId}/comment/${commentId}/deleteReply`);

export const likeComment = (postId: string, commentId: string) =>
    BASE_API.put(`/${postId}/comments/${commentId}/like`);



