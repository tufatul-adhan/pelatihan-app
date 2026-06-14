import axios, { AxiosInstance } from 'axios';
import { Training, ApiResponse } from '../types';
import { toPriceNumber } from '../utils/currency';

const API_BASE_URL = 'http://localhost:3001/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Map backend response to frontend Training type
const mapToTraining = (data: any): Training => ({
  id: data.id,
  title: data.nama_pelatihan || data.title,
  description: data.deskripsi || data.description,
  duration: data.duration,
  price: toPriceNumber(data.harga ?? data.price),
  createdAt: data.created_at || data.createdAt || data.tanggal,
  updatedAt: data.updated_at || data.updatedAt,
});

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface GetTrainingsOptions {
  forceRefresh?: boolean;
  limit?: number;
}

class TrainingService {
  private api: AxiosInstance;
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor to attach token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  private getCacheKey(endpoint: string): string {
    return endpoint;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && this.isCacheValid(entry.timestamp)) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  private invalidateTrainingCache(): void {
    Array.from(this.cache.keys()).forEach((key) => {
      if (key.startsWith('/pelatihan')) {
        this.cache.delete(key);
      }
    });
  }

  async getTrainings(options: GetTrainingsOptions = {}): Promise<Training[]> {
    const { forceRefresh = false, limit = 100 } = options;
    const cacheKey = this.getCacheKey(`/pelatihan?limit=${limit}`);
    
    // Check cache first
    const cached = !forceRefresh ? this.getFromCache(cacheKey) : null;
    if (cached && !forceRefresh) {
      return cached;
    }

    try {
      let page = 1;
      let total = 0;
      let merged: any[] = [];

      do {
        const response = await this.api.get<ApiResponse<any[]>>('/pelatihan', {
          params: { page, limit },
        });

        const chunk = response.data.data || [];
        merged = merged.concat(chunk);
        total = (response.data as any).total || chunk.length;
        page += 1;
      } while (merged.length < total);

      const mapped = merged.map(mapToTraining);
      this.setCache(cacheKey, mapped);
      return mapped;
    } catch (error) {
      console.error('Error fetching trainings:', error);
      throw error;
    }
  }

  async getTraining(id: number): Promise<Training> {
    try {
      const response = await this.api.get<ApiResponse<any>>(`/pelatihan/${id}`);
      if (!response.data.data) throw new Error('Training not found');
      return mapToTraining(response.data.data);
    } catch (error) {
      console.error('Error fetching training:', error);
      throw error;
    }
  }

  async createTraining(training: Omit<Training, 'id'>): Promise<Training> {
    try {
      const payload = {
        nama_pelatihan: training.title,
        deskripsi: training.description,
        harga: training.price || 0,
        duration: training.duration,
        tanggal: new Date().toISOString(),
      };
      const response = await this.api.post<ApiResponse<any>>(
        '/pelatihan',
        payload
      );
      if (!response.data.data) throw new Error('Failed to create training');
      
      // Invalidate cache
      this.invalidateTrainingCache();
      
      return mapToTraining(response.data.data);
    } catch (error) {
      console.error('Error creating training:', error);
      throw error;
    }
  }

  async updateTraining(
    id: number,
    training: Partial<Training>
  ): Promise<Training> {
    try {
      const payload: any = {};
      if (training.title) payload.nama_pelatihan = training.title;
      if (training.description) payload.deskripsi = training.description;
      if (training.price !== undefined) payload.harga = training.price;
      if (training.duration !== undefined) payload.duration = training.duration;
      payload.tanggal = training.createdAt || new Date().toISOString();
      
      const response = await this.api.put<ApiResponse<any>>(
        `/pelatihan/${id}`,
        payload
      );
      if (!response.data.data) throw new Error('Failed to update training');
      
      // Invalidate cache
      this.invalidateTrainingCache();
      
      return mapToTraining(response.data.data);
    } catch (error) {
      console.error('Error updating training:', error);
      throw error;
    }
  }

  async deleteTraining(id: number): Promise<void> {
    try {
      await this.api.delete(`/pelatihan/${id}`);
      
      // Invalidate cache
      this.invalidateTrainingCache();
    } catch (error) {
      console.error('Error deleting training:', error);
      throw error;
    }
  }
}

const trainingService = new TrainingService();

export default trainingService;
