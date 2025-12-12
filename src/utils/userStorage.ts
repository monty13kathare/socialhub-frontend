// src/utils/userStorage.ts

import type { User } from "../types/types";

// Define the shape of your user data
// export interface UserData {
//     firstName?: string;
//     lastName?: string;
//     username?: string;
//     email?: string;
//     avatar?: string;
//     [key: string]: any; // allow extra fields if needed
// }

const USER_KEY = "authUser";

// ✅ Store user data
export const setUser = (user: User | any) => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Failed to save user data:", error);
    }
};

// ✅ Store user data
export const setUpdatedUser = (user: User | any) => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Failed to save user data:", error);
    }
};
// ✅ Get user data
export const getUser = (): User | null => {
    try {
        const stored = localStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error("Failed to parse user data:", error);
        return null;
    }
};

// ✅ Remove user data
export const removeUser = () => {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error("Failed to remove user data:", error);
    }
};
