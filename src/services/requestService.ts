import axios, { AxiosInstance } from 'axios';
import { TrainingRequest, ApiResponse, Permintaan } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class RequestService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private buildReadableError(error: unknown, fallbackMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as { message?: string; error?: string } | undefined;
      const serverMessage = data?.message || data?.error;

      if (status === 401) {
        return new Error('Sesi login berakhir. Silakan login ulang.');
      }

      if (status === 403) {
        return new Error('Akses ditolak. Akun ini tidak memiliki izin admin.');
      }

      if (!error.response) {
        return new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      }

      if (serverMessage) {
        return new Error(serverMessage);
      }
    }

    if (error instanceof Error && error.message) {
      return new Error(error.message);
    }

    return new Error(fallbackMessage);
  }

  private normalizeStatus(status?: string): 'pending' | 'diproses' | 'ditolak' | 'selesai' {
    const value = (status || '').toLowerCase().trim();
    if (!value) return 'pending';
    if (value === 'approved') return 'diproses';
    if (value === 'completed') return 'selesai';
    if (value === 'rejected' || value === 'cancelled') return 'ditolak';
    if (value === 'pending' || value === 'diproses' || value === 'ditolak' || value === 'selesai') {
      return value;
    }
    return 'pending';
  }

  async getRequests(): Promise<TrainingRequest[]> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>('/permintaan');
      const requests = response.data.data || [];
      return requests.map((req: any) => ({
        id: req.id,
        nama: req.nama || '',
        email: req.email || '',
        perusahaan: req.perusahaan || '',
        pelatihan: req.pelatihan_id?.toString() || '',
        tanggal: req.tanggal || '',
        jumlahPeserta: req.jumlah_peserta || 0,
        deskripsi: req.deskripsi || '',
        status: this.normalizeStatus(req.status),
        createdAt: req.created_at,
      }));
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw this.buildReadableError(error, 'Gagal memuat permintaan');
    }
  }

  async getAllRequests(): Promise<Permintaan[]> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>('/permintaan?limit=100');
      const requests = response.data.data || [];
      return requests.map((req: any) => ({
        id: req.id,
        user_id: req.user_id || req.userId || '-',
        nama: req.nama || '',
        email: req.email || '',
        pelatihan_id: req.nama_pelatihan || req.pelatihan_id || req.pelatihanId || '-',
        jumlah_peserta: req.jumlah_peserta || req.jumlahPeserta || 0,
        status: this.normalizeStatus(req.status),
        created_at: req.created_at || req.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw this.buildReadableError(error, 'Gagal memuat data permintaan');
    }
  }

  async submitRequest(request: TrainingRequest): Promise<TrainingRequest> {
    try {
      const deskripsiLengkap = [
        request.tanggal ? `Tanggal pelaksanaan: ${request.tanggal}` : '',
        request.deskripsi,
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        nama: request.nama,
        email: request.email,
        perusahaan: request.perusahaan,
        pelatihan_id: parseInt(request.pelatihan, 10) || 0,
        jumlah_peserta: request.jumlahPeserta,
        deskripsi: deskripsiLengkap,
      };
      const response = await this.api.post<ApiResponse<any>>('/permintaan', payload);
      if (!response.data.data) throw new Error('Failed to submit request');
      return {
        id: response.data.data.id,
        nama: request.nama,
        email: request.email,
        perusahaan: request.perusahaan,
        pelatihan: request.pelatihan,
        tanggal: request.tanggal,
        jumlahPeserta: response.data.data.jumlah_peserta,
        deskripsi: response.data.data.deskripsi,
        createdAt: response.data.data.created_at,
      };
    } catch (error) {
      console.error('Error submitting request:', error);
      throw this.buildReadableError(error, 'Gagal mengirim permintaan pelatihan');
    }
  }

  async updateRequestStatus(
    id: number,
    status: 'pending' | 'diproses' | 'ditolak' | 'selesai'
  ): Promise<'pending' | 'diproses' | 'ditolak' | 'selesai'> {
    try {
      const response = await this.api.put<ApiResponse<{ status?: string }>>(`/permintaan/${id}`, {
        status,
      });
      return this.normalizeStatus(response.data.data?.status || status);
    } catch (error) {
      console.error('Error updating request status:', error);
      throw this.buildReadableError(error, 'Gagal memperbarui status permintaan');
    }
  }
}

const requestService = new RequestService();

export default requestService;
