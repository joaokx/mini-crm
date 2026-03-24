import React, { useState, useEffect } from 'react';
import { serviceApi, patientApi } from '../services/api';
import { Plus, CheckCircle, Trash2, User as UserIcon, Play, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../components/Toast';

interface Patient {
    id: string;
    name: string;
}

interface Service {
    id: string;
    description: string;
    status: 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'FINALIZADO';
    patient: { name: string };
    createdAt: string;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

const Services: React.FC = () => {
    const { toast } = useToast();
    const [services, setServices] = useState<Service[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, pages: 1 });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isIdling, setIsIdling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [formData, setFormData] = useState({ description: '', patientId: '' });

    const fetchServices = async () => {
        setIsIdling(true);
        try {
            const response = await serviceApi.getAll({
                page: meta?.page || 1,
                limit: meta?.limit || 10,
                status: filterStatus || undefined
            });

            const { data: list, meta: newMeta } = response.data;

            setServices(list || []);
            setMeta(newMeta || { total: 0, page: 1, limit: 10, pages: 1 });
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
            setIsIdling(false);
        }
    };

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meta?.page, filterStatus]);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await patientApi.getAll();
            setPatients(response.data.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await serviceApi.create(formData);
            toast('Atendimento criado com sucesso!', 'success');
            setIsModalOpen(false);
            setFormData({ description: '', patientId: '' });
            setMeta(prev => ({ ...prev, page: 1 }));
            fetchServices();
        } catch (error: any) {
            toast(error.response?.data?.message || 'Erro ao criar atendimento', 'error');
        }
    };

    const handleStatusUpdate = async (id: string, currentStatus: string) => {
        let nextStatus = '';
        if (currentStatus === 'AGUARDANDO') nextStatus = 'EM_ATENDIMENTO';
        else if (currentStatus === 'EM_ATENDIMENTO') nextStatus = 'FINALIZADO';
        else return;

        try {
            await serviceApi.updateStatus(id, nextStatus);
            toast(`Status atualizado para ${nextStatus}`, 'success');
            fetchServices();
        } catch (error: any) {
            toast(error.response?.data?.message || 'Erro ao atualizar status', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este atendimento?')) {
            try {
                await serviceApi.delete(id);
                toast('Atendimento excluído!', 'success');
                fetchServices();
            } catch (error) {
                console.error('Error deleting service:', error);
                toast('Erro ao excluir atendimento', 'error');
            }
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'AGUARDANDO': return <span className="badge badge-waiting">Aguardando</span>;
            case 'EM_ATENDIMENTO': return <span className="badge badge-processing">Em Atendimento</span>;
            case 'FINALIZADO': return <span className="badge badge-done">Finalizado</span>;
            default: return null;
        }
    };

    return (
        <div className={`services-page ${isIdling ? 'loading-fade' : ''}`}>
            <header className="content-header">
                <div>
                    <h1 className="content-title">Atendimentos</h1>
                    <p className="user-role" style={{ marginTop: '0.25rem' }}>Gerencie o fluxo de atendimento da clínica</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Novo Atendimento
                </button>
            </header>

            <div className="filters-bar" style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Filter size={16} />
                    <span>Filtrar por:</span>
                </div>
                <select
                    className="select"
                    style={{ width: '200px' }}
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setMeta(prev => ({ ...prev, page: 1 }));
                    }}
                >
                    <option value="">Todos os Status</option>
                    <option value="AGUARDANDO">Aguardando</option>
                    <option value="EM_ATENDIMENTO">Em Atendimento</option>
                    <option value="FINALIZADO">Finalizado</option>
                </select>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Paciente</th>
                            <th>Descrição</th>
                            <th>Data/Hora</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Carregando atendimentos...</td></tr>
                        ) : services.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Nenhum atendimento encontrado para os filtros selecionados.</td></tr>
                        ) : (
                            services.map(service => (
                                <tr key={service.id}>
                                    <td>{statusBadge(service.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 24, height: 24, backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                                <UserIcon size={12} color="var(--primary)" />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{service.patient.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {service.description}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                        {new Date(service.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {service.status === 'AGUARDANDO' && (
                                                <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleStatusUpdate(service.id, service.status)}>
                                                    <Play size={14} /> Atender
                                                </button>
                                            )}
                                            {service.status === 'EM_ATENDIMENTO' && (
                                                <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--success)' }} onClick={() => handleStatusUpdate(service.id, service.status)}>
                                                    <CheckCircle size={14} /> Finalizar
                                                </button>
                                            )}
                                            <button className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--danger)' }} onClick={() => handleDelete(service.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span>Mostrando <b>{services.length}</b> de <b>{meta?.total || 0}</b> atendimentos</span>
                <div className="pagination-controls" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-outline"
                        disabled={!meta || meta.page <= 1}
                        onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600 }}>
                        {meta?.page || 1} / {meta?.pages || 1}
                    </div>
                    <button
                        className="btn btn-outline"
                        disabled={!meta || meta.page >= meta.pages}
                        onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Registrar Novo Atendimento</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>Inicie um novo ciclo de atendimento para um paciente cadastrado.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="label">Paciente</label>
                                <select
                                    className="select"
                                    required
                                    value={formData.patientId}
                                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                                >
                                    <option value="">Selecione um paciente...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Descrição do Atendimento</label>
                                <textarea
                                    className="textarea"
                                    rows={4}
                                    required
                                    placeholder="Descreva o motivo do atendimento ou sintomas relatados..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirmar Registro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
