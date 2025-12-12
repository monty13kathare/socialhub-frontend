import axios from "axios";
import { getToken } from "../utils/cookieHelper";

const apiUrl = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL:  `${apiUrl}/auth`  
    // "http://localhost:5000/api/auth",
});

// 🧠 Add token to every request automatically
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Register user
export const registerUser = (data: {
    name: string;
    email: string;
    password: string;
}) => API.post("/register", data);

// ✅ Verify OTP
export const verifyOtp = (data: { email: string, otp: string }) => API.post("/verify-otp", data);

// ✅ Complete Profile
export const completeProfile = (data: any) => API.post("/complete-profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
});


// ✅ Login
export const loginUser = (data: { email: string; password: string }) =>
    API.post("/login", data);

// ✅ Google Login
export const googleLogin = (data:any) =>
    API.post("/social-login", data);