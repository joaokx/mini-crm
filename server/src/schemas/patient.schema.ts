import { z } from 'zod';

export const createPatientSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    phone: z.string().min(10, 'Telefone deve ter no mínimo 10 caracteres'),
});

export const updatePatientSchema = createPatientSchema.partial();
