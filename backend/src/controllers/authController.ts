// src/controllers/authController.ts

import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { RegisterRequest, AuthRequest, User } from '../types';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { nama, email, password } = req.body as RegisterRequest;

      // Validation
      if (!nama || !email || !password) {
        sendError(res, 'Nama, email, and password are required', undefined, 400);
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        sendError(res, 'Email already registered', undefined, 409);
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const userId = await UserModel.create(nama, email, hashedPassword);
      const role: User['role'] = 'user';
      const token = generateToken({
        id: userId,
        email,
        role,
      });

      sendSuccess(
        res,
        'User registered successfully',
        {
          user: {
            id: userId,
            email,
            nama,
            role,
          },
          token,
        },
        201
      );
    } catch (error) {
      sendError(
        res,
        'Registration failed',
        (error as Error).message,
        500
      );
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as AuthRequest;

      // Validation
      if (!email || !password) {
        sendError(res, 'Email and password are required', undefined, 400);
        return;
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        sendError(res, 'Invalid email or password', undefined, 401);
        return;
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        sendError(res, 'Invalid email or password', undefined, 401);
        return;
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Return user data and token
      const { password: _, ...userWithoutPassword } = user;
      sendSuccess(res, 'Login successful', {
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      sendError(
        res,
        'Login failed',
        (error as Error).message,
        500
      );
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', undefined, 401);
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        sendError(res, 'User not found', undefined, 404);
        return;
      }

      const { password: _, ...userWithoutPassword } = user;
      sendSuccess(res, 'Profile retrieved successfully', userWithoutPassword);
    } catch (error) {
      sendError(
        res,
        'Failed to get profile',
        (error as Error).message,
        500
      );
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', undefined, 401);
        return;
      }

      const rawNama = String(req.body?.nama || '').trim();
      const rawEmail = String(req.body?.email || '').trim().toLowerCase();

      if (!rawNama || !rawEmail) {
        sendError(res, 'Nama and email are required', undefined, 400);
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(rawEmail)) {
        sendError(res, 'Invalid email format', undefined, 400);
        return;
      }

      const existingEmail = await UserModel.findByEmailExcludingId(rawEmail, req.user.id);
      if (existingEmail) {
        sendError(res, 'Email already registered by another account', undefined, 409);
        return;
      }

      const updated = await UserModel.update(req.user.id, rawNama, rawEmail);
      if (!updated) {
        sendError(res, 'Failed to update profile', undefined, 500);
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        sendError(res, 'User not found', undefined, 404);
        return;
      }

      const { password: _, ...userWithoutPassword } = user;
      sendSuccess(res, 'Profile updated successfully', userWithoutPassword);
    } catch (error) {
      sendError(
        res,
        'Failed to update profile',
        (error as Error).message,
        500
      );
    }
  }
}
