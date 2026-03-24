import { PrismaClient } from '@prisma/client';

// SQLite-compatible: no enum, use string constants
export const ServiceStatus = {
    AGUARDANDO: 'AGUARDANDO',
    EM_ATENDIMENTO: 'EM_ATENDIMENTO',
    FINALIZADO: 'FINALIZADO',
} as const;

export type ServiceStatusType = typeof ServiceStatus[keyof typeof ServiceStatus];

export class ServiceRepository {
    constructor(private prisma: PrismaClient) { }

    async findMany(params: {
        skip?: number;
        take?: number;
        status?: string;
        patientId?: string;
    } = {}) {
        const { skip, take, status, patientId } = params;
        return this.prisma.service.findMany({
            skip,
            take,
            where: {
                ...(status ? { status } : {}),
                ...(patientId ? { patientId } : {}),
            },
            include: { patient: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async count(status?: string, patientId?: string) {
        return this.prisma.service.count({
            where: {
                ...(status ? { status } : {}),
                ...(patientId ? { patientId } : {}),
            }
        });
    }

    async findById(id: string) {
        return this.prisma.service.findUnique({
            where: { id },
            include: { patient: true }
        });
    }

    async create(data: { description: string; patientId: string }) {
        return this.prisma.service.create({
            data: {
                description: data.description,
                patientId: data.patientId,
                status: ServiceStatus.AGUARDANDO
            }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.service.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.service.delete({ where: { id } });
    }
}
