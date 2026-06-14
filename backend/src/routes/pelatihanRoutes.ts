// src/routes/pelatihanRoutes.ts

import { Router } from 'express';
import { PelatihanController } from '../controllers/pelatihanController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', PelatihanController.getAll);
router.get('/:id', PelatihanController.getById);

// Admin only routes
router.post('/', authMiddleware, roleMiddleware(['admin']), PelatihanController.create);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), PelatihanController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), PelatihanController.delete);

export default router;
