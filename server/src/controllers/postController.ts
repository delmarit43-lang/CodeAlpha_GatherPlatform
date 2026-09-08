import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as postService from '../services/postService';
import * as likeService from '../services/likeService';
import * as commentService from '../services/commentService';
import { AuthRequest } from '../types';
import { createPostSchema, createCommentSchema } from '../validators/schemas';

function getParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUserId = (req as AuthRequest).user?.id ?? 0;
    const posts = await postService.getFeedPosts(currentUserId);
    res.json(posts);
  } catch (err) { next(err); }
}

export async function getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const postId = parseInt(getParam(req.params.id), 10);
    const currentUserId = (req as AuthRequest).user?.id ?? 0;
    const post = await postService.getPostById(postId, currentUserId);
    res.json(post);
  } catch (err) { next(err); }
}

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createPostSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.id;
    const post = await postService.createPost(userId, data);
    res.status(201).json(post);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ success: false, message: err.issues[0]?.message || 'Validation failed' });
      return;
    }
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const postId = parseInt(getParam(req.params.id), 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await postService.deletePost(postId, userId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const postId = parseInt(getParam(req.params.id), 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await likeService.likePost(userId, postId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function unlikePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const postId = parseInt(getParam(req.params.id), 10);
    const userId = (req as AuthRequest).user!.id;
    const result = await likeService.unlikePost(userId, postId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const postId = parseInt(getParam(req.params.id), 10);
    const comments = await commentService.getComments(postId);
    res.json(comments);
  } catch (err) { next(err); }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createCommentSchema.parse(req.body);
    const postId = parseInt(getParam(req.params.id), 10);
    const userId = (req as AuthRequest).user!.id;
    const comment = await commentService.createComment(userId, postId, data);
    res.status(201).json(comment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ success: false, message: err.issues[0]?.message || 'Validation failed' });
      return;
    }
    next(err);
  }
}
