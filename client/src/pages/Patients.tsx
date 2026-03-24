import React, { useState, useEffect, useRef } from 'react';
import { patientApi } from '../services/api';
import { Plus, Edit, Trash2, Search, Phone, User as UserIcon, MessageCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

interface Patient {
    id: string;
    name: string;
    phone: string;
    createdAt: string;
}

const Patients: React.FC = () => {
    const { toast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });

    // Add debounce search
    const [searchQuery, setSearchQuery] = useState('');
    const debounceTimeoutInfo = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear previous timeout
        if (debounceTimeoutInfo.current) {
            clearTimeout(debounceTimeoutInfo.current);
        }

        setLoading(true);
        // Set new timeout for debounce API call
        debounceTimeoutInfo.current = setTimeout(() => {
            fetchPatients(searchQuery);
        }, 500);

        return () => {
            if (debounceTimeoutInfo.current) clearTimeout(debounceTimeoutInfo.current);
        };
    }, [searchQuery]);

    const fetchPatients = async (searchTerm = '') => {
        try {
            const response = await patientApi.getAll({ search: searchTerm });
            setPatients(response.data.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            toast('Erro ao buscar pacientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPatient) {
                await patientApi.update(editingPatient.id, formData);
                toast('Paciente atualizado com sucesso!', 'success');
            } else {
                await patientApi.create(formData);
                toast('Paciente cadastrado com sucesso!', 'success');
            }
            setIsModalOpen(false);
            setEditingPatient(null);
            setFormData({ name: '', phone: '' });
            fetchPatients(searchQuery);
        } catch (error) {
            console.error('Error saving patient:', error);
            toast('Erro ao salvar paciente', 'error');
        }
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setFormData({ name: patient.name, phone: patient.phone });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                await patientApi.delete(id);
                toast('Paciente excluído!', 'success');
                fetchPatients(searchQuery);
            } catch (error) {
                console.error('Error deleting patient:', error);
                toast('Erro ao excluir paciente', 'error');
            }
        }
    };

    return (
        <div className="patients-page">
            <header className="content-header">
                <h1 className="content-title">Pacientes</h1>
                <button className="btn btn-primary" onClick={() => {
                    setEditingPatient(null);
                    setFormData({ name: '', phone: '' });
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} />
                    Novo Paciente
                </button>
            </header>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Buscar por nome ou telefone..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Data de Cadastro</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
                        ) : patients.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum paciente encontrado.</td></tr>
                        ) : (
                            patients.map(patient => (
                                <tr key={patient.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                                                <UserIcon size={16} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{patient.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                            <Phone size={14} />
                                            {patient.phone}
                                        </div>
                                    </td>
                                    <td>{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <a
                                                href={`https://api.whatsapp.com/send?phone=${patient.phone.replace(/\D/g, '')}&text=Olá ${patient.name}, aqui é da Yoog Saúde!`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-outline"
                                                style={{ padding: '0.375rem', color: '#10b981', borderColor: '#10b981' }}
                                                title="Enviar WhatsApp"
                                            >
                                                <MessageCircle size={16} />
                                            </a>
                                            <button className="btn btn-outline" onClick={() => handleEdit(patient)} style={{ padding: '0.375rem' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn btn-outline" onClick={() => handleDelete(patient.id)} style={{ padding: '0.375rem', color: 'var(--danger)' }}>
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="label">Nome Completo</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Telefone / WhatsApp</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
