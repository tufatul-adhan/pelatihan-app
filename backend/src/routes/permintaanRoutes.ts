// src/routes/permintaanRoutes.ts

import { Router } from 'express';
import { PermintaanController } from '../controllers/permintaanController';
import { authMiddleware, optionalAuthMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// User routes
router.post('/', optionalAuthMiddleware, PermintaanController.create);
router.get('/user/my-requests', authMiddleware, PermintaanController.getByUser);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['admin']), PermintaanController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), PermintaanController.updateStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), PermintaanController.delete);

export default router;
