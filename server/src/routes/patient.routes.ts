import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { PatientService } from '../services/patient.service.js';
import { PatientRepository } from '../repositories/patient.repository.js';
import { prisma } from '../db.js';

const router = Router();
const patientRepo = new PatientRepository(prisma);
const patientService = new PatientService(patientRepo);
const patientController = new PatientController(patientService);

router.get('/', (req, res) => patientController.getAll(req, res));
router.get('/:id', (req, res) => patientController.getById(req, res));
router.post('/', (req, res) => patientController.create(req, res));
router.put('/:id', (req, res) => patientController.update(req, res));
router.delete('/:id', (req, res) => patientController.deletePatient(req, res));

export default router;
