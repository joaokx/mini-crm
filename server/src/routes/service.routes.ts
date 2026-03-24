import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';
import { ServiceService } from '../services/service.service.js';
import { ServiceRepository } from '../repositories/service.repository.js';
import { prisma } from '../db.js';

const router = Router();
const serviceRepo = new ServiceRepository(prisma);
const serviceService = new ServiceService(serviceRepo);
const serviceController = new ServiceController(serviceService);

router.get('/', (req, res) => serviceController.getAll(req, res));
router.get('/:id', (req, res) => serviceController.getById(req, res));
router.post('/', (req, res) => serviceController.create(req, res));
router.patch('/:id/status', (req, res) => serviceController.updateStatus(req, res));
router.delete('/:id', (req, res) => serviceController.deleteService(req, res));

export default router;
