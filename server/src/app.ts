import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import dotenv from 'dotenv';
import patientRoutes from './routes/patient.routes.js';
import serviceRoutes from './routes/service.routes.js';
import authRoutes from './routes/auth.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
// @ts-ignore
app.use('/api/patients', authMiddleware, patientRoutes);
// @ts-ignore
app.use('/api/services', authMiddleware, serviceRoutes);

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Structured Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errorData = {
        method: req.method,
        path: req.path,
        message: err.message,
        timestamp: new Date().toISOString()
    };

    if (err.name === 'ZodError' || err.errors) {
        console.warn('[Validation Error]', JSON.stringify(errorData));
        return res.status(400).json({
            status: 'error',
            message: 'Erro de validação de dados',
            errors: err.errors
        });
    }

    console.error('[Internal Error]', JSON.stringify(errorData));
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Ocorreu um erro interno no servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export { app, prisma };
