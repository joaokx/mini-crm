import request from 'supertest';
import { app, prisma } from '../app.js';

describe('Patient API Integration Tests', () => {
    let token = '';
    let createdPatientId = '';

    beforeAll(async () => {
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
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should create a new patient with valid data', async () => {
        const response = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'João da Silva', phone: '11988887766' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('João da Silva');
        createdPatientId = response.body.id;
    });

    it('should return 400 for invalid patient data', async () => {
        const response = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Jo', phone: '123' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });

    it('should list patients with pagination meta', async () => {
        const response = await request(app)
            .get('/api/patients')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).toHaveProperty('meta');
        expect(response.body.meta).toHaveProperty('total');
        expect(response.body.meta).toHaveProperty('pages');
    });

    it('should find patient by id', async () => {
        const response = await request(app)
            .get(`/api/patients/${createdPatientId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createdPatientId);
    });

    it('should search patients by name', async () => {
        const response = await request(app)
            .get('/api/patients?search=João')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].name).toContain('João');
    });

    it('should return empty list for unknown search term', async () => {
        const response = await request(app)
            .get('/api/patients?search=XYZ_NAOEXISTE')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(0);
    });

    it('should update a patient', async () => {
        const response = await request(app)
            .put(`/api/patients/${createdPatientId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'João Atualizado', phone: '11999998888' });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('João Atualizado');
    });

    it('should delete a patient', async () => {
        const response = await request(app)
            .delete(`/api/patients/${createdPatientId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204);
    });

    it('should return 404 after deleting patient', async () => {
        const response = await request(app)
            .get(`/api/patients/${createdPatientId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});
