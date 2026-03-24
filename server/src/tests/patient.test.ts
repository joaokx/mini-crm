import request from 'supertest';
import { app, prisma } from '../app.js';

describe('Patient API Integration Tests', () => {
    let token = '';

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
            .send({
                name: 'João da Silva',
                phone: '11988887766'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('João da Silva');
    });

    it('should return 400 for invalid patient data', async () => {
        const response = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Jo', // Too short
                phone: '123'  // Too short
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });

    it('should list patients', async () => {
        const response = await request(app)
            .get('/api/patients')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
