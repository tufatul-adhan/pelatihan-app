// src/controllers/permintaanController.ts

import { Request, Response } from 'express';
import { PermintaanModel } from '../models/Permintaan';
import { PelatihanModel } from '../models/Pelatihan';
import { UserModel } from '../models/User';
import { hashPassword } from '../utils/password';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export class PermintaanController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nama, email, perusahaan, pelatihan_id, jumlah_peserta, deskripsi } = req.body;

      // Validation
      if (!pelatihan_id || !jumlah_peserta) {
        sendError(
          res,
          'pelatihan_id and jumlah_peserta are required',
          undefined,
          400
        );
        return;
      }

      if (isNaN(jumlah_peserta) || jumlah_peserta <= 0) {
        sendError(
          res,
          'jumlah_peserta must be a positive number',
          undefined,
          400
        );
        return;
      }

      // Check if pelatihan exists
      const pelatihan = await PelatihanModel.findById(pelatihan_id);
      if (!pelatihan) {
        sendError(res, 'Pelatihan not found', undefined, 404);
        return;
      }

      let userId = req.user?.id;

      if (!userId) {
        if (!nama || !email) {
          sendError(
            res,
            'nama and email are required for public requests',
            undefined,
            400
          );
          return;
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const generatedPassword = await hashPassword(
            `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`
          );
          userId = await UserModel.create(nama, email, generatedPassword);
        }
      }

      const contactDescription = [
        perusahaan ? `Perusahaan: ${perusahaan}` : '',
        nama ? `Nama: ${nama}` : '',
        email ? `Email: ${email}` : '',
        deskripsi || '',
      ]
        .filter(Boolean)
        .join('\n');

      // Create permintaan
      const id = await PermintaanModel.create(
        userId,
        pelatihan_id,
        jumlah_peserta,
        contactDescription
      );

      sendSuccess(
        res,
        'Permintaan created successfully',
        {
          id,
          user_id: userId,
          pelatihan_id,
          jumlah_peserta,
          deskripsi: contactDescription,
          status: 'pending',
        },
        201
      );
    } catch (error) {
      sendError(
        res,
        'Failed to create permintaan',
        (error as Error).message,
        500
      );
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const permintaan = await PermintaanModel.getAll(limit, offset);
      const total = await PermintaanModel.getCount();

      sendPaginated(
        res,
        'Permintaan retrieved successfully',
        permintaan,
        total,
        page,
        limit
      );
    } catch (error) {
      sendError(
        res,
        'Failed to get permintaan',
        (error as Error).message,
        500
      );
    }
  }

  static async getByUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', undefined, 401);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const permintaan = await PermintaanModel.getByUserId(req.user.id, limit, offset);
      const total = await PermintaanModel.getCountByUserId(req.user.id);

      sendPaginated(
        res,
        'User permintaan retrieved successfully',
        permintaan,
        total,
        page,
        limit
      );
    } catch (error) {
      sendError(
        res,
        'Failed to get user permintaan',
        (error as Error).message,
        500
      );
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validation
      if (!status) {
        sendError(res, 'Status is required', undefined, 400);
        return;
      }

      const statusAliases: Record<string, 'pending' | 'diproses' | 'ditolak' | 'selesai'> = {
        pending: 'pending',
        approved: 'diproses',
        diproses: 'diproses',
        rejected: 'ditolak',
        cancelled: 'ditolak',
        ditolak: 'ditolak',
        completed: 'selesai',
        selesai: 'selesai',
      };

      const normalizedStatus = statusAliases[String(status).toLowerCase().trim()];
      const validStatuses = ['pending', 'diproses', 'ditolak', 'selesai'];
      if (!normalizedStatus) {
        sendError(
          res,
          `Status must be one of: ${validStatuses.join(', ')}`,
          undefined,
          400
        );
        return;
      }

      // Check if permintaan exists
      const permintaan = await PermintaanModel.findById(parseInt(id));
      if (!permintaan) {
        sendError(res, 'Permintaan not found', undefined, 404);
        return;
      }

      // Update status
      const success = await PermintaanModel.updateStatus(parseInt(id), normalizedStatus);

      if (!success) {
        sendError(res, 'Failed to update permintaan status', undefined, 500);
        return;
      }

      sendSuccess(res, 'Permintaan status updated successfully', {
        id,
        status: normalizedStatus,
      });
    } catch (error) {
      sendError(
        res,
        'Failed to update permintaan',
        (error as Error).message,
        500
      );
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if permintaan exists
      const permintaan = await PermintaanModel.findById(parseInt(id));
      if (!permintaan) {
        sendError(res, 'Permintaan not found', undefined, 404);
        return;
      }

      // Delete permintaan
      const success = await PermintaanModel.delete(parseInt(id));

      if (!success) {
        sendError(res, 'Failed to delete permintaan', undefined, 500);
        return;
      }

      sendSuccess(res, 'Permintaan deleted successfully', { id });
    } catch (error) {
      sendError(
        res,
        'Failed to delete permintaan',
        (error as Error).message,
        500
      );
    }
  }
}
