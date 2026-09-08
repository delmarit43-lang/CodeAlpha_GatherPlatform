import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_SECRET || 'gather_jwt_secret_key_super_secure_2026';
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, ACCESS_SECRET) as AuthPayload;
}
