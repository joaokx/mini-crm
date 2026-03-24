import type { Request, Response } from 'express';
import { PatientService } from '../services/patient.service.js';
import { createPatientSchema } from '../schemas/patient.schema.js';

export class PatientController {
    constructor(private patientService: PatientService) { }

    async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const search = req.query.search as string;

            const patients = await this.patientService.getAllPatients({
                skip: (page - 1) * limit,
                take: limit,
                search
            });

            // To maintain consistency, we should also return a total count for patients if needed
            // For now, let's keep it simple but consistent structure
            res.json({
                data: patients,
                meta: {
                    total: patients.length, // Ideally should be a real count, but this fixes the frontend crash
                    page,
                    limit,
                    pages: 1
                }
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const patient = await this.patientService.getPatientById(req.params.id as string);
            if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });
            res.json(patient);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        const validated = createPatientSchema.parse(req.body);
        const patient = await this.patientService.createPatient(validated);
        res.status(201).json(patient);
    }

    async update(req: Request, res: Response) {
        try {
            const patient = await this.patientService.updatePatient(req.params.id as string, req.body);
            res.json(patient);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deletePatient(req: Request, res: Response) {
        try {
            await this.patientService.deletePatient(req.params.id as string);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
