// src/models/Pelatihan.ts

import { query } from '../config/database';
import { Pelatihan } from '../types';

export interface PelatihanRow extends Pelatihan {}

export class PelatihanModel {
  static async findById(id: number): Promise<Pelatihan | null> {
    const results = await query<PelatihanRow[]>(
      'SELECT * FROM pelatihan WHERE id = ?',
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async getAll(limit: number = 100, offset: number = 0): Promise<Pelatihan[]> {
    return query<Pelatihan[]>(
      'SELECT * FROM pelatihan ORDER BY tanggal DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  static async getCount(): Promise<number> {
    const results = await query<any>('SELECT COUNT(*) as count FROM pelatihan');
    return Number(results[0].count);
  }

  static async create(
    nama_pelatihan: string,
    deskripsi: string,
    harga: number,
    tanggal: Date,
    duration?: string | null
  ): Promise<number> {
    const result = await query<any>(
      'INSERT INTO pelatihan (nama_pelatihan, deskripsi, harga, duration, tanggal) VALUES (?, ?, ?, ?, ?)',
      [nama_pelatihan, deskripsi, harga, duration || null, tanggal]
    );
    return result.insertId;
  }

  static async update(
    id: number,
    nama_pelatihan: string,
    deskripsi: string,
    harga: number,
    tanggal: Date,
    duration?: string | null
  ): Promise<boolean> {
    const result = await query<any>(
      'UPDATE pelatihan SET nama_pelatihan = ?, deskripsi = ?, harga = ?, duration = ?, tanggal = ? WHERE id = ?',
      [nama_pelatihan, deskripsi, harga, duration || null, tanggal, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query<any>('DELETE FROM pelatihan WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
