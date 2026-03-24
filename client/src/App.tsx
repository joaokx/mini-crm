import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, LogOut, HeartPulse } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Services from './pages/Services';
import Login from './pages/Login';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { logout, user } = useAuth();

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="logo">
                    <HeartPulse className="logo-icon" size={28} />
                    <span>Yoog<b>Saúde</b></span>
                </div>
                <nav className="nav">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard size={20} />
                        <span>Painel</span>
                    </NavLink>
                    <NavLink to="/patients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Users size={20} />
                        <span>Pacientes</span>
                    </NavLink>
                    <NavLink to="/services" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <ClipboardList size={20} />
                        <span>Atendimentos</span>
                    </NavLink>
                </nav>
                <div className="sidebar-footer">
                    <div className="nav-item" onClick={logout}>
                        <LogOut size={20} />
                        <span>Sair (Logout)</span>
                    </div>
                </div>
            </aside>
            <main className="content">
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px #d1fae5' }} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Yoog Saúde — Portal da Secretária Remota</span>
                    </div>
                    <div className="header-user">
                        <div className="user-info">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-role">{user?.email}</p>
                        </div>
                        <div className="user-avatar">{user?.name?.substring(0, 2).toUpperCase()}</div>
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/*" element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/patients" element={<Patients />} />
                                        <Route path="/services" element={<Services />} />
                                    </Routes>
                                </MainLayout>
                            </PrivateRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
