import request from 'supertest';
import { app, prisma } from '../app.js';

describe('Service Lifecycle Integration Tests', () => {
    let patientId: string;
    let token = '';

    beforeAll(async () => {
        // Clear DB or use a test DB. For simplicity here, we create a test patient.
        await prisma.service.deleteMany();
        await prisma.patient.deleteMany();
        await prisma.user.deleteMany();

        const res = await request(app).post('/api/auth/register').send({
            name: 'Test',
            email: 'test' + Date.now() + '@test.com',
            password: 'password123'
        });
        const loginRes = await request(app).post('/api/auth/login').send({
            email: res.body.email,
            password: 'password123'
        });
        token = loginRes.body.token;

        const patient = await prisma.patient.create({
            data: { name: 'Test Patient', phone: '123456789' }
        });
        patientId = patient.id;
    });

    afterAll(async () => {
        // Cleanup
        await prisma.service.deleteMany();
        await prisma.patient.deleteMany();
        await prisma.$disconnect();
    });

    it('should create a new service with status AGUARDANDO', async () => {
        const response = await request(app)
            .post('/api/services')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Initial consultation',
                patientId: patientId
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('AGUARDANDO');
        expect(response.body.description).toBe('Initial consultation');
    });

    it('should FAIL to transition from AGUARDANDO directly to FINALIZADO', async () => {
        const service = await prisma.service.create({
            data: { description: 'Test transition', patientId, status: 'AGUARDANDO' }
        });

        const response = await request(app)
            .patch(`/api/services/${service.id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'FINALIZADO' });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('EM_ATENDIMENTO');
    });

    it('should complete a full transition cycle: AGUARDANDO -> EM_ATENDIMENTO -> FINALIZADO', async () => {
        const service = await prisma.service.create({
            data: { description: 'Full cycle test', patientId, status: 'AGUARDANDO' }
        });

        // To EM_ATENDIMENTO
        let response = await request(app)
            .patch(`/api/services/${service.id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'EM_ATENDIMENTO' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('EM_ATENDIMENTO');

        // To FINALIZADO
        response = await request(app)
            .patch(`/api/services/${service.id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'FINALIZADO' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('FINALIZADO');
    });

    it('should FAIL to change status of a FINALIZADO service', async () => {
        const service = await prisma.service.create({
            data: { description: 'Finalized test', patientId, status: 'FINALIZADO' }
        });

        const response = await request(app)
            .patch(`/api/services/${service.id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'EM_ATENDIMENTO' });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('FINALIZADOS não podem ter o status alterado');
    });
});

