import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL: `${apiUrl}/user`
    //  "http://localhost:5000/api/user",
});

// 🧠 Add token to every request automatically
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// ✅ My Profile
export const myProfile = () => API.get("/me", {
});

// ✅ Update Profile
export const updateProfile = (data: any) => API.put("/update", data, {
    headers: { "Content-Type": "multipart/form-data" },
});

// ✅ get All Users
export const getAllUsers = () => API.get("/all");

export const getChatUsers = () => API.get("/chat-users");


export const getUserDetail = (userId:string) => API.get(`/${userId}`);


// ➕ Follow a user
export const followUser = (userId: string) =>
    API.put(`/${userId}/follow`);

// ➖ Unfollow user
export const unfollowUser = (userId: string) =>
    API.put(`/${userId}/unfollow`);

// 👥 Get user's followers
export const getFollowers = (userId: string) =>
    API.get(`/${userId}/followers`);

// 🔗 Get user's following list
export const getFollowing = (userId: string) =>
    API.get(`/${userId}/following`);

// 🔗 Delete Account
export const deleteAccount = () =>
    API.delete(`/delete-account`);


export const LikedPost = () =>
    API.get(`/likedPost`);