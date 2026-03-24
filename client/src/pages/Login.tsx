import React, { useState } from 'react';
import { HeartPulse, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authApi.login({ email: formData.email, password: formData.password });
            login(response.data.token, response.data.user);
            toast('Bem-vindo de volta!', 'success');
            navigate('/');
        } catch (error: any) {
            toast(error.response?.data?.message || 'Erro ao processar solicitação', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                        <HeartPulse size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Yoog Saúde</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                        Faça login para acessar o portal da secretária remota
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">E-mail</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                className="input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">Senha</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Aguarde...' : 'Entrar na Plataforma'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Para criar uma conta, contate o administrador do sistema Yoog Saúde.
                </div>
            </div>
        </div>
    );
};

export default Login;
