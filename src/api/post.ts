import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";


const API = axios.create({
    baseURL:  `${apiUrl}/posts`
    //  "http://localhost:5000/api/posts",
     

});

// 🧠 Add token to every request automatically
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export const createPost = (data: any) => API.post("/", data);


export const getAllPosts = () => API.get("/");

export const getUserPosts = (userId: string) => API.get(`/user/${userId}`);


export const toggleLike = (postId: string) =>
    API.put(`/${postId}/like`);

export const addComment = (postId: string, text: string) =>
    API.post(`/${postId}/comment`, { text });

export const deleteComment = (postId: string, commentId: string) =>
    API.delete(`/${postId}/comment/${commentId}`);


// ADD COMMENT REPLY
export const addReplyAPI = (postId:string, commentId:string, text:string) =>
  API.post(`${postId}/comments/${commentId}/reply`, { text });

// DELETE REPLY
export const deleteReplyAPI = (postId:string, commentId:string, replyId:string) =>
  API.delete(`${postId}/comments/${commentId}/reply/${replyId}`);

// LIKE / UNLIKE COMMENT
export const likeCommentAPI = (postId:string, commentId:string) =>
  API.put(`${postId}/comments/${commentId}/like`);


export const sharePost = (postId: string) =>
    API.post(`/${postId}/share`);


export const updatePost = (postId: string, data: any) =>
    API.put(`/${postId}`, data);

export const deletePost = (postId: string) => API.delete(`/${postId}`);


export const votePollAPI = (postId: string, optionIndex: number) => {
  return API.post(`/${postId}/vote`, 
    { optionIndex }, // <-- request body
    {
      headers: { "Content-Type": "application/json" } // <-- config
    }
  );
};
