import { z } from 'zod';

export const createServiceSchema = z.object({
    description: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
    patientId: z.string().uuid('ID do paciente deve ser um UUID válido'),
});

export const updateStatusSchema = z.object({
    status: z.enum(['AGUARDANDO', 'EM_ATENDIMENTO', 'FINALIZADO']),
});
