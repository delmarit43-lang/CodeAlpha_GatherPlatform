import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────
export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  identity: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

// ── User ──────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(300).optional(),
  location: z.string().max(100).optional(),
  avatar_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});

// ── Post ──────────────────────────────────────────────────────
export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

// ── Comment ──────────────────────────────────────────────────
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
