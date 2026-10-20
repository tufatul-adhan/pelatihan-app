import axios, { AxiosInstance } from 'axios';
import { AuthResponse, User } from '../types';
import { appPath } from '../utils/publicPath';

const API_BASE_URL = 'http://localhost:3001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to attach token to requests
axiosInstance.interceptors.request.use(
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

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = appPath('/login');
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(
    nama: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', {
        nama,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }

  async updateProfile(nama: string, email: string): Promise<User> {
    try {
      const response = await axiosInstance.put('/auth/profile', { nama, email });
      const updatedUser = response.data?.data as User | undefined;
      if (!updatedUser) {
        throw new Error('Gagal memperbarui profil');
      }
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  setAuthToken(token: string | null): void {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

const instance = new AuthService();

export default instance;
