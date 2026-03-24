export enum ServiceStatus {
    AGUARDANDO = 'AGUARDANDO',
    EM_ATENDIMENTO = 'EM_ATENDIMENTO',
    FINALIZADO = 'FINALIZADO',
}

export interface Patient {
    id: string;
    name: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Service {
    id: string;
    description: string;
    status: ServiceStatus;
    patientId: string;
    patient?: Patient;
    createdAt: Date;
    updatedAt: Date;
}
