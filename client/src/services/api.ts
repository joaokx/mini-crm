import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('@MiniCRM:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('@MiniCRM:token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    me: () => api.get('/auth/me')
};

export const patientApi = {
    getAll: (params?: any) => api.get('/patients', { params }),
    getById: (id: string) => api.get(`/patients/${id}`),
    create: (data: any) => api.post('/patients', data),
    update: (id: string, data: any) => api.put(`/patients/${id}`, data),
    delete: (id: string) => api.delete(`/patients/${id}`),
};

export const serviceApi = {
    getAll: (params?: any) => api.get('/services', { params }),
    getById: (id: string) => api.get(`/services/${id}`),
    create: (data: any) => api.post('/services', data),
    updateStatus: (id: string, status: string) => api.patch(`/services/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/services/${id}`),
};
