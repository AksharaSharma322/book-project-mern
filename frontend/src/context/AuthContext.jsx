import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token on initial load
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            const data = response.data;

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || err.response?.data?.message || err.message || "Network error"
            };
        }
    };

    const register = async (email, password) => {
        try {
            const response = await axios.post('/auth/register', { email, password });
            const data = response.data;

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            } else {
                // If backend registers but doesn't return token immediately (some do, some don't)
                // The current backend implementation returns { token, user } on register too.
                return { success: false, error: data.message || 'Registration failed' };
            }
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || err.response?.data?.message || err.message || "Network error"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
