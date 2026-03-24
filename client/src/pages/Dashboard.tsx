import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi, patientApi } from '../services/api';
import { Users, Clock, Play, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ patients: 0, waiting: 0, processing: 0, done: 0 });
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const [patientsRes, servicesRes] = await Promise.all([
                patientApi.getAll({ limit: 1000 }),
                serviceApi.getAll({ limit: 1000 })
            ]);

            const svcList: any[] = servicesRes.data.data || [];
            const patList: any[] = patientsRes.data.data || [];

            setServices(svcList);
            setStats({
                patients: patList.length,
                waiting: svcList.filter(s => s.status === 'AGUARDANDO').length,
                processing: svcList.filter(s => s.status === 'EM_ATENDIMENTO').length,
                done: svcList.filter(s => s.status === 'FINALIZADO').length,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Data for pie chart
    const pieData = [
        { name: 'Aguardando', value: stats.waiting },
        { name: 'Em Atendimento', value: stats.processing },
        { name: 'Finalizados', value: stats.done },
    ].filter(d => d.value > 0);

    // Data for bar chart — group services by date (last 7 days)
    const barData = (() => {
        const days: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
            days[key] = 0;
        }
        services.forEach(s => {
            const d = new Date(s.createdAt);
            const key = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
            if (key in days) days[key]++;
        });
        return Object.entries(days).map(([name, total]) => ({ name, total }));
    })();

    // Area chart — cumulative done services
    const areaData = (() => {
        const done = services
            .filter(s => s.status === 'FINALIZADO')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        let cum = 0;
        const result: { name: string; finalizados: number }[] = [];
        const seen = new Set<string>();
        done.forEach(s => {
            const key = new Date(s.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!seen.has(key)) { seen.add(key); result.push({ name: key, finalizados: 0 }); }
            result[result.length - 1].finalizados = ++cum;
        });
        return result.slice(-10);
    })();

    const totalServices = stats.waiting + stats.processing + stats.done;
    const completionRate = totalServices > 0 ? Math.round((stats.done / totalServices) * 100) : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem 1rem', boxShadow: 'var(--shadow)' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
                    {payload.map((p: any) => (
                        <p key={p.name} style={{ color: p.color, fontSize: '0.875rem' }}>{p.name}: <b>{p.value}</b></p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const exportToExcel = () => {
        const dataForExcel = services.map(s => ({
            'Data de Criação': new Date(s.createdAt).toLocaleString('pt-BR'),
            'Paciente': s.patient?.name || 'Desconhecido',
            'Descrição': s.description,
            'Status': s.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Atendimentos');
        XLSX.writeFile(workbook, `Relatorio_MiniCRM_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="dashboard-page">
            <header className="content-header">
                <div>
                    <h1 className="content-title">Painel de Controle</h1>
                    <p className="user-role" style={{ marginTop: '0.25rem' }}>Visão geral da clínica em tempo real</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <Activity size={14} />
                    Atualizado agora
                </div>
            </header>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total de Pacientes', value: stats.patients, icon: Users, bg: '#e0f2fe', color: '#0369a1' },
                    { label: 'Aguardando', value: stats.waiting, icon: Clock, bg: '#fee2e2', color: '#991b1b' },
                    { label: 'Em Atendimento', value: stats.processing, icon: Play, bg: '#fef3c7', color: '#92400e' },
                    { label: 'Finalizados', value: stats.done, icon: CheckCircle, bg: '#dcfce7', color: '#166534' },
                ].map(({ label, value, icon: Icon, bg, color }) => (
                    <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: bg, padding: '0.75rem', borderRadius: '0.5rem', color, display: 'flex', flexShrink: 0 }}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
                                {loading ? '—' : value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Bar Chart */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>Atendimentos por Dia</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Últimos 7 dias</p>
                        </div>
                        <TrendingUp size={18} color="var(--primary)" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barData} barCategoryGap="35%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="total" name="Atendimentos" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="card">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600 }}>Status dos Atendimentos</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Distribuição atual</p>
                    </div>
                    {pieData.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Nenhum atendimento registrado
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
                {/* Area Chart */}
                <div className="card">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600 }}>Atendimentos Finalizados — Acumulado</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Evolução histórica de conclusões</p>
                    </div>
                    {areaData.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Finalize atendimentos para ver a evolução
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="colorFin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="finalizados" name="Finalizados" stroke="#10b981" strokeWidth={2.5} fill="url(#colorFin)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Ações Rápidas</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Taxa de conclusão: <b style={{ color: '#10b981' }}>{completionRate}%</b></p>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${completionRate}%`, background: 'linear-gradient(90deg, var(--primary), #10b981)', borderRadius: 999, transition: 'width 1s ease' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button className="btn btn-primary" style={{ justifyContent: 'flex-start', fontSize: '0.875rem' }} onClick={() => navigate('/patients')}>
                            + Cadastrar Paciente
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: '0.875rem' }} onClick={() => navigate('/services')}>
                            ▶ Novo Atendimento
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: '0.875rem' }} onClick={exportToExcel}>
                            ⬇ Relatório em Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
