import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// @ts-ignore
router.post('/register', (req, res) => authController.register(req, res));
// @ts-ignore
router.post('/login', (req, res) => authController.login(req, res));
// @ts-ignore
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

export default router;
