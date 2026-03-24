import { ServiceRepository, ServiceStatus } from '../repositories/service.repository.js';

export class ServiceService {
    constructor(private serviceRepo: ServiceRepository) { }

    async getAllServices(params?: { skip?: number; take?: number; status?: string }) {
        return this.serviceRepo.findMany(params);
    }

    async getServicesCount(status?: string) {
        return this.serviceRepo.count(status);
    }

    async getServiceById(id: string) {
        return this.serviceRepo.findById(id);
    }

    async createService(data: { description: string; patientId: string }) {
        return this.serviceRepo.create(data);
    }

    async updateStatus(id: string, newStatus: string) {
        const service = await this.serviceRepo.findById(id);
        if (!service) throw new Error('Atendimento não encontrado');

        const currentStatus = service.status;

        if (currentStatus === newStatus) return service;

        // Regras de Transição: AGUARDANDO → EM_ATENDIMENTO → FINALIZADO
        if (currentStatus === ServiceStatus.AGUARDANDO) {
            if (newStatus !== ServiceStatus.EM_ATENDIMENTO) {
                throw new Error('De AGUARDANDO só é possível transitar para EM_ATENDIMENTO.');
            }
        } else if (currentStatus === ServiceStatus.EM_ATENDIMENTO) {
            if (newStatus !== ServiceStatus.FINALIZADO) {
                throw new Error('De EM_ATENDIMENTO só é possível transitar para FINALIZADO.');
            }
        } else if (currentStatus === ServiceStatus.FINALIZADO) {
            throw new Error('Atendimentos FINALIZADOS não podem ter o status alterado.');
        }

        return this.serviceRepo.update(id, { status: newStatus });
    }

    async deleteService(id: string) {
        return this.serviceRepo.delete(id);
    }
}
