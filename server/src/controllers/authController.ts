import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { AuthRequest } from '../types';
import { registerSchema, loginSchema } from '../validators/schemas';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach(issue => {
        const path = issue.path[0];
        if (typeof path === 'string') {
          errors[path] = issue.message;
        }
      });
      res.status(422).json({ success: false, message: 'Validation failed', errors });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ success: false, message: 'Validation failed' });
      return;
    }
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getCurrentUser((req as AuthRequest).user!.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}
