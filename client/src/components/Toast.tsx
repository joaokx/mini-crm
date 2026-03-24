import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => { } });

const ICONS: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

const COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: '#f0fdf4', border: '#86efac', color: '#166534' },
    error: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
    warning: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e' },
    info: { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                zIndex: 9999,
                maxWidth: '20rem',
            }}>
                {toasts.map(t => {
                    const { bg, border, color } = COLORS[t.type];
                    return (
                        <div key={t.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            backgroundColor: bg,
                            border: `1px solid ${border}`,
                            color,
                            borderRadius: '0.625rem',
                            padding: '0.875rem 1rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                            animation: 'slideInRight 0.3s ease',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        }}>
                            <span style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: color, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                            }}>
                                {ICONS[t.type]}
                            </span>
                            {t.message}
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(110%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
