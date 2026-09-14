import { Request } from 'express';

export interface AuthPayload {
  id: number;
  username: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// Safe user (no password hash)
export interface SafeUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  cover_url?: string | null;
  bio: string | null;
  location: string | null;
  created_at: Date;
}

export interface UserProfile extends SafeUser {
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export interface PostWithMeta {
  id: number;
  user_id: number;
  content: string;
  image_url: string | null;
  created_at: Date;
  user: {
    id: number;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

export interface CommentWithUser {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: Date;
  user: {
    id: number;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface NotificationWithActor {
  id: number;
  type: string;
  is_read: boolean;
  created_at: Date;
  post_id: number | null;
  actor: {
    id: number;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}
