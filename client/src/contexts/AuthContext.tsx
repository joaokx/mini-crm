import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('@MiniCRM:token');
            if (token) {
                try {
                    const response = await authApi.me();
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('@MiniCRM:token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('@MiniCRM:token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('@MiniCRM:token');
        setUser(null);
        toast('Sessão encerrada', 'info');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
