import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "token",
            userToken
        );
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};