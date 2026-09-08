import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log(' Successfully connected to PostgreSQL database via Prisma!');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(` PostgreSQL DB connection failed (${message}). Check your DATABASE_URL in .env`);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Gather Platform Production Server (TypeScript + Prisma)`);
    console.log(` Server URL: http://localhost:${PORT}`);
    console.log(` Web App:    http://localhost:${PORT}/home.html`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

startServer();
