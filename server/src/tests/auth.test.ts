import request from 'supertest';
import { app, prisma } from '../app.js';

describe('Auth API Integration Tests', () => {
    const email = `auth_test_${Date.now()}@test.com`;
    const password = 'password123';

    beforeAll(async () => {
        await prisma.service.deleteMany();
        await prisma.patient.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should register a new user', async () => {
        const response = await request(app).post('/api/auth/register').send({
            name: 'Test User',
            email,
            password
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(email);
        expect(response.body).not.toHaveProperty('password');
    });

    it('should reject registration with duplicate email', async () => {
        const response = await request(app).post('/api/auth/register').send({
            name: 'Test User 2',
            email,
            password
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('E-mail indisponível');
    });

    it('should reject registration with invalid data', async () => {
        const response = await request(app).post('/api/auth/register').send({
            name: 'Ab',
            email: 'not-an-email',
            password: '123'
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });

    it('should login with valid credentials and return token', async () => {
        const response = await request(app).post('/api/auth/login').send({ email, password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(email);
    });

    it('should reject login with wrong password', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email,
            password: 'wrongpassword'
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('should reject login with unknown email', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: 'nobody@test.com',
            password
        });

        expect(response.status).toBe(401);
    });

    it('should return current user data with valid token', async () => {
        const loginRes = await request(app).post('/api/auth/login').send({ email, password });
        const token = loginRes.body.token;

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe(email);
        expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when accessing protected route without token', async () => {
        const response = await request(app).get('/api/patients');

        expect(response.status).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
        const response = await request(app)
            .get('/api/patients')
            .set('Authorization', 'Bearer invalidtoken123');

        expect(response.status).toBe(401);
    });
});
