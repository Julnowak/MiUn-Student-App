import client from "./client";
import {API_BASE_URL} from "./config";

export const register = async (username, password) => {
    return client.post(API_BASE_URL + "register/", { username, password });
};

export const login = async (username, password) => {
    const response = await client.post(API_BASE_URL + "login/", { username, password });
    if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
    }
    return response.data;
};

export const logout = async () => {
    try{
        const response = await client.post(API_BASE_URL + "logout/", {});
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    } catch (err){
        console.log(err)
    }

};

export const getUser = async () => {
    const token = localStorage.getItem("access");
    if (!token) return null;

    try {
        const response = await client.get(API_BASE_URL + "user/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
    }
};
