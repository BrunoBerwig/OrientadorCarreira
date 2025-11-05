import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setIsLoading(false);
    }, [token]);
    const login = async (email, senha) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, senha });
        
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);

        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const register = async (nome, email, senha) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, { nome, email, senha });
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);