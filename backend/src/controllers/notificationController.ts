import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';
import { AuthRequest } from '../types';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user!.id;
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user!.id;
    const result = await notificationService.markAllRead(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markOneRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const notificationId = parseInt(rawId, 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await notificationService.markOneRead(notificationId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
