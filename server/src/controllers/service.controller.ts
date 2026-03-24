import type { Request, Response } from 'express';
import { ServiceService } from '../services/service.service.js';
import { createServiceSchema, updateStatusSchema } from '../schemas/service.schema.js';

export class ServiceController {
    constructor(private serviceService: ServiceService) { }

    async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as any;

            const services = await this.serviceService.getAllServices({
                skip: (page - 1) * limit,
                take: limit,
                status
            });

            const total = await this.serviceService.getServicesCount(status);

            res.json({
                data: services,
                meta: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const service = await this.serviceService.getServiceById(req.params.id as string);
            if (!service) return res.status(404).json({ error: 'Atendimento não encontrado' });
            res.json(service);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        const validated = createServiceSchema.parse(req.body);
        const service = await this.serviceService.createService(validated);
        res.status(201).json(service);
    }

    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = updateStatusSchema.parse(req.body);
        const service = await this.serviceService.updateStatus(id, status);
        res.json(service);
    }

    async deleteService(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.serviceService.deleteService(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
