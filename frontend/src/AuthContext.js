import { createContext, useState, useEffect } from "react";
import { getUser, login, logout } from "./api";

export const AuthContext = createContext();

export const isUserAuthenticated = () => {
    const token = localStorage.getItem("access");
    return token !== null;  // Return true if the token exists, false otherwise
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUser();
            setUser(userData);
        };
        fetchUser();
    }, []);

    const loginUser = async (username, password) => {
        await login(username, password);
        const userData = await getUser();
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logoutUser = () => {
        logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("access") !== null &&
        localStorage.getItem("refresh") !== null
    );

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
