import { PrismaClient } from '@prisma/client';

export class PatientRepository {
    constructor(private prisma: PrismaClient) { }

    async findMany(params: { skip?: number; take?: number; search?: string } = {}) {
        const { skip, take, search } = params;
        return this.prisma.patient.findMany({
            skip,
            take,
            where: search ? {
                OR: [
                    // SQLite: no 'mode' support, uses LIKE which is case-insensitive by default
                    { name: { contains: search } },
                    { phone: { contains: search } }
                ]
            } : undefined,
            orderBy: { createdAt: 'desc' }
        });
    }

    async count(search?: string) {
        return this.prisma.patient.count({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { phone: { contains: search } }
                ]
            } : undefined
        });
    }

    async findById(id: string) {
        return this.prisma.patient.findUnique({
            where: { id },
            include: { services: true }
        });
    }

    async create(data: { name: string; phone: string }) {
        return this.prisma.patient.create({ data });
    }

    async update(id: string, data: any) {
        return this.prisma.patient.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.patient.delete({ where: { id } });
    }
}
