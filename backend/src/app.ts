import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allowed for CDN scripts (Lucide icons, Google Fonts)
  })
);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Serve Static Frontend Files from frontend/
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));


// API v1 Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);

// Also alias /api/v1 for strict spec compliance
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Fallback for API routes
app.get('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found.' });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
