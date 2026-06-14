// src/models/User.ts

import { RowDataPacket } from 'mysql2/promise';
import { query } from '../config/database';
import { User } from '../types';

export interface UserRow extends RowDataPacket, User {}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const results = await query<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async findById(id: number): Promise<User | null> {
    const results = await query<UserRow[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async findByEmailExcludingId(email: string, excludedId: number): Promise<User | null> {
    const results = await query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? AND id <> ?',
      [email, excludedId]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async create(nama: string, email: string, password: string): Promise<number> {
    const result = await query<any>(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, password, 'user']
    );
    return result.insertId;
  }

  static async getAll(): Promise<User[]> {
    return query<User[]>('SELECT id, nama, email, role FROM users');
  }

  static async update(id: number, nama: string, email: string): Promise<boolean> {
    const result = await query<any>(
      'UPDATE users SET nama = ?, email = ? WHERE id = ?',
      [nama, email, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query<any>('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async updateRole(id: number, role: string): Promise<boolean> {
    const result = await query<any>(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    return result.affectedRows > 0;
  }
}
