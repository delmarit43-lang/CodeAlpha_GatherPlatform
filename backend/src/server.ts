import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './lib/prisma';

let port = Number(process.env.PORT) || 5000;

async function startServer(initialPort: number) {
  try {
    // Verify DB connection
    await prisma.$connect();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`PostgreSQL DB connection failed (${message}). Check your DATABASE_URL in .env`);
  }

  function tryListen(p: number) {
    const server = app.listen(p, () => {
      console.log(`Server URL: http://localhost:${p}`);
      console.log(`Web App:    http://localhost:${p}/home.html`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${p} is busy, automatically switching to port ${p + 1}...`);
        tryListen(p + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  }

  tryListen(initialPort);
}

startServer(port);
