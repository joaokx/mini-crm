import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export class AuthController {

    async register(req: Request, res: Response) {
        const validated = registerSchema.parse(req.body);

        const existing = await prisma.user.findUnique({ where: { email: validated.email } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'E-mail indisponível' });
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10);

        const user = await prisma.user.create({
            data: {
                name: validated.name,
                email: validated.email,
                password: hashedPassword
            }
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    }

    async login(req: Request, res: Response) {
        const validated = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: validated.email } });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
        }

        const validPassword = await bcrypt.compare(validated.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }

    async me(req: any, res: Response) {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ status: 'error', message: 'Usuário não encontrado' });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    }
}
