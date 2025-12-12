import Cookies from "js-cookie";

// Set token
export const setToken = (token: string, expiresDays: number = 7) => {
    Cookies.set("authToken", token, { expires: expiresDays, sameSite: "Strict" });
};

// Get token
export const getToken = (): string | undefined => {
    return Cookies.get("authToken");
};

// Remove token
export const removeToken = () => {
    Cookies.remove("authToken");
};
