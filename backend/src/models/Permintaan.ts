// src/models/Permintaan.ts

import { RowDataPacket } from 'mysql2/promise';
import { query } from '../config/database';
import { Permintaan } from '../types';

export interface PermintaanRow extends RowDataPacket, Permintaan {}

export class PermintaanModel {
  static async findById(id: number): Promise<Permintaan | null> {
    const results = await query<PermintaanRow[]>(
      'SELECT * FROM permintaan WHERE id = ?',
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async getAll(limit: number = 100, offset: number = 0): Promise<Permintaan[]> {
    return query<Permintaan[]>(
      `SELECT p.*, u.nama, u.email, pel.nama_pelatihan 
       FROM permintaan p
       JOIN users u ON p.user_id = u.id
       JOIN pelatihan pel ON p.pelatihan_id = pel.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  static async getByUserId(
    userId: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<Permintaan[]> {
    return query<Permintaan[]>(
      `SELECT p.*, pel.nama_pelatihan, pel.harga
       FROM permintaan p
       JOIN pelatihan pel ON p.pelatihan_id = pel.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  }

  static async getCount(): Promise<number> {
    const results = await query<any>('SELECT COUNT(*) as count FROM permintaan');
    return results[0].count;
  }

  static async getCountByUserId(userId: number): Promise<number> {
    const results = await query<any>(
      'SELECT COUNT(*) as count FROM permintaan WHERE user_id = ?',
      [userId]
    );
    return results[0].count;
  }

  static async create(
    userId: number,
    pelatihanId: number,
    jumlahPeserta: number,
    deskripsi: string
  ): Promise<number> {
    const result = await query<any>(
      `INSERT INTO permintaan (user_id, pelatihan_id, jumlah_peserta, deskripsi, status)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, pelatihanId, jumlahPeserta, deskripsi, 'pending']
    );
    return result.insertId;
  }

  static async updateStatus(
    id: number,
    status: 'pending' | 'diproses' | 'ditolak' | 'selesai'
  ): Promise<boolean> {
    const result = await query<any>(
      'UPDATE permintaan SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query<any>('DELETE FROM permintaan WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
