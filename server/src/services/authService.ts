import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/schemas';
import { SafeUser } from '../types';

function toSafeUser(user: {
  id: number; fullName: string; username: string; email: string;
  avatarUrl: string | null; bio: string | null; location: string | null; createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    full_name: user.fullName,
    username: user.username,
    email: user.email,
    avatar_url: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    created_at: user.createdAt,
  };
}

export async function registerUser(data: RegisterInput) {
  const { full_name, username, email, password } = data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    },
  });

  if (existing) {
    throw new AppError('Username or email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: full_name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  const safeUser = toSafeUser(user);
  const token = generateToken({ id: user.id, username: user.username, email: user.email });

  return { token, user: safeUser };
}

export async function loginUser(data: LoginInput) {
  const { identity, password } = data;
  const clean = identity.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: clean }, { username: clean }],
    },
  });

  if (!user) {
    throw new AppError('Invalid email/username or password.', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email/username or password.', 401);
  }

  const safeUser = toSafeUser(user);
  const token = generateToken({ id: user.id, username: user.username, email: user.email });

  return { token, user: safeUser };
}

export async function getCurrentUser(userId: number): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);
  return toSafeUser(user);
}
