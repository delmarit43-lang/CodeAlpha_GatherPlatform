import { Request, Response, NextFunction } from 'express';
import * as bookmarkService from '../services/bookmarkService';
import { AuthRequest } from '../types';

export async function getBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).user!.id;
    const bookmarks = await bookmarkService.getBookmarks(userId);
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
}

export async function addBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawPostId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const postId = parseInt(rawPostId, 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await bookmarkService.addBookmark(userId, postId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function removeBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawPostId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const postId = parseInt(rawPostId, 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await bookmarkService.removeBookmark(userId, postId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
