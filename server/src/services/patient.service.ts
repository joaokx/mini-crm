import { PatientRepository } from '../repositories/patient.repository.js';

export class PatientService {
    constructor(private patientRepo: PatientRepository) { }

    async getAllPatients(params?: { skip?: number; take?: number; search?: string }) {
        return this.patientRepo.findMany(params);
    }

    async getPatientById(id: string) {
        return this.patientRepo.findById(id);
    }

    async createPatient(data: { name: string; phone: string }) {
        return this.patientRepo.create(data);
    }

    async updatePatient(id: string, data: any) {
        return this.patientRepo.update(id, data);
    }

    async deletePatient(id: string) {
        return this.patientRepo.delete(id);
    }
}
