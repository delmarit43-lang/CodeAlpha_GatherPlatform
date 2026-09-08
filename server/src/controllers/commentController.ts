import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService';
import { AuthRequest } from '../types';

export async function deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const commentId = parseInt(rawId, 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await commentService.deleteComment(commentId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
