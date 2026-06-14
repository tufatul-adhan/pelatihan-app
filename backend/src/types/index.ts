// src/types/index.ts

export interface User {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  created_at?: Date;
  updated_at?: Date;
}

export interface Pelatihan {
  id: number;
  nama_pelatihan: string;
  deskripsi: string;
  harga: number;
  duration?: string | null;
  tanggal: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Permintaan {
  id: number;
  user_id: number;
  pelatihan_id: number;
  jumlah_peserta: number;
  deskripsi: string;
  status: 'pending' | 'diproses' | 'ditolak' | 'selesai';
  created_at?: Date;
  updated_at?: Date;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  nama: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
