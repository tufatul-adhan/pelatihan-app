// Training type
export interface Training {
  id: number;
  title: string;
  description: string;
  duration?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Request form type
export interface TrainingRequest {
  id?: number;
  nama: string;
  email: string;
  perusahaan: string;
  pelatihan: string;
  tanggal: string;
  jumlahPeserta: number;
  deskripsi: string;
  createdAt?: string;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Notification type
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// User type
export interface User {
  id: number;
  nama: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

// Auth response type
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
  error?: string;
}

// Login credentials type
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register data type
export interface RegisterData {
  nama: string;
  email: string;
  password: string;
}

export interface Permintaan {
  id: number;
  user_id?: number | string;
  nama?: string;
  email?: string;
  pelatihan_id?: number | string;
  jumlah_peserta?: number;
  status?: 'pending' | 'diproses' | 'ditolak' | 'selesai' | string;
  created_at?: string;
}
