import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export function errorHandler(
  err: AppError | Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma errors
  const prismaErr = err as { code?: string; meta?: { target?: string[] } };
  if (prismaErr.code === 'P2002') {
    const field = prismaErr.meta?.target?.[0] ?? 'field';
    res.status(409).json({ success: false, message: `A record with that ${field} already exists.` });
    return;
  }
  if (prismaErr.code === 'P2025') {
    res.status(404).json({ success: false, message: 'Record not found.' });
    return;
  }

  console.error('[Unhandled Error]', err);

  res.status(500).json({
    success: false,
    message: isDev ? err.message : 'An internal server error occurred.',
  });
}
