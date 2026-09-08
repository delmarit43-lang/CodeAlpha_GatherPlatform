import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/userService';
import * as postService from '../services/postService';
import { AuthRequest } from '../types';
import { updateProfileSchema } from '../validators/schemas';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUserId = (req as AuthRequest).user?.id ?? 0;
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
    const profile = await userService.getUserProfile(username, currentUserId);
    res.json(profile);
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.id;
    const updated = await userService.updateProfile(userId, data);
    res.json(updated);
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

export async function searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const currentUserId = (req as AuthRequest).user!.id;
    const results = await userService.searchUsers(q, currentUserId);
    res.json(results);
  } catch (err) { next(err); }
}

export async function followUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const followerId = (req as AuthRequest).user!.id;
    const rawTarget = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const targetId = parseInt(rawTarget, 10);
    const result = await userService.followUser(followerId, targetId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function unfollowUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const followerId = (req as AuthRequest).user!.id;
    const rawTarget = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const targetId = parseInt(rawTarget, 10);
    const result = await userService.unfollowUser(followerId, targetId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getUserPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUserId = (req as AuthRequest).user?.id ?? 0;
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
    const tab = typeof req.query.tab === 'string' ? req.query.tab : 'posts';
    const posts = await postService.getPostsByUser(username, currentUserId, tab);
    res.json(posts);
  } catch (err) { next(err); }
}
