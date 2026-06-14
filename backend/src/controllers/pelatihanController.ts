// src/controllers/pelatihanController.ts

import { Request, Response } from 'express';
import { PelatihanModel } from '../models/Pelatihan';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export class PelatihanController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const pelatihan = await PelatihanModel.getAll(limit, offset);
      const total = await PelatihanModel.getCount();

      sendPaginated(res, 'Pelatihan retrieved successfully', pelatihan, total, page, limit);
    } catch (error) {
      sendError(
        res,
        'Failed to get pelatihan',
        (error as Error).message,
        500
      );
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pelatihan = await PelatihanModel.findById(parseInt(id));

      if (!pelatihan) {
        sendError(res, 'Pelatihan not found', undefined, 404);
        return;
      }

      sendSuccess(res, 'Pelatihan retrieved successfully', pelatihan);
    } catch (error) {
      sendError(
        res,
        'Failed to get pelatihan',
        (error as Error).message,
        500
      );
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nama_pelatihan, deskripsi, harga, tanggal, duration } = req.body;

      // Validation
      if (!nama_pelatihan || !deskripsi || !harga || !tanggal) {
        sendError(
          res,
          'nama_pelatihan, deskripsi, harga, and tanggal are required',
          undefined,
          400
        );
        return;
      }

      if (isNaN(harga) || harga <= 0) {
        sendError(res, 'Harga must be a positive number', undefined, 400);
        return;
      }

      const id = await PelatihanModel.create(
        nama_pelatihan,
        deskripsi,
        harga,
        new Date(tanggal),
        duration
      );

      sendSuccess(
        res,
        'Pelatihan created successfully',
        {
          id,
          nama_pelatihan,
          deskripsi,
          harga,
          duration: duration || null,
          tanggal,
        },
        201
      );
    } catch (error) {
      sendError(
        res,
        'Failed to create pelatihan',
        (error as Error).message,
        500
      );
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nama_pelatihan, deskripsi, harga, tanggal, duration } = req.body;
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        sendError(res, 'Invalid pelatihan id', undefined, 400);
        return;
      }

      const pelatihan = await PelatihanModel.findById(numericId);
      if (!pelatihan) {
        sendError(res, 'Pelatihan not found', undefined, 404);
        return;
      }

      // Allow partial/legacy payloads from frontend and keep old values if omitted.
      const finalNamaPelatihan = nama_pelatihan ?? pelatihan.nama_pelatihan;
      const finalDeskripsi = deskripsi ?? pelatihan.deskripsi;
      const finalHarga = harga ?? pelatihan.harga;
      const finalDuration = duration ?? pelatihan.duration ?? null;
      const finalTanggal = tanggal ?? pelatihan.tanggal;

      if (!finalNamaPelatihan || !finalDeskripsi || !finalTanggal) {
        sendError(
          res,
          'nama_pelatihan, deskripsi, and tanggal are required',
          undefined,
          400
        );
        return;
      }

      if (isNaN(Number(finalHarga)) || Number(finalHarga) <= 0) {
        sendError(res, 'Harga must be a positive number', undefined, 400);
        return;
      }

      const success = await PelatihanModel.update(
        numericId,
        finalNamaPelatihan,
        finalDeskripsi,
        Number(finalHarga),
        new Date(finalTanggal),
        finalDuration
      );

      if (!success) {
        sendError(res, 'Failed to update pelatihan', undefined, 500);
        return;
      }

      sendSuccess(res, 'Pelatihan updated successfully', {
        id: numericId,
        nama_pelatihan: finalNamaPelatihan,
        deskripsi: finalDeskripsi,
        harga: Number(finalHarga),
        duration: finalDuration,
        tanggal: finalTanggal,
      });
    } catch (error) {
      sendError(
        res,
        'Failed to update pelatihan',
        (error as Error).message,
        500
      );
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const pelatihan = await PelatihanModel.findById(parseInt(id));
      if (!pelatihan) {
        sendError(res, 'Pelatihan not found', undefined, 404);
        return;
      }

      const success = await PelatihanModel.delete(parseInt(id));

      if (!success) {
        sendError(res, 'Failed to delete pelatihan', undefined, 500);
        return;
      }

      sendSuccess(res, 'Pelatihan deleted successfully', { id });
    } catch (error) {
      sendError(
        res,
        'Failed to delete pelatihan',
        (error as Error).message,
        500
      );
    }
  }
}
