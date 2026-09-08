/* Gather Platform - Express Application Configuration */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allowed for CDN scripts (Lucide, Google Fonts)
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Serve Static Frontend Files from public/
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

// API Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all route to serve index.html or 404 for unknown API
app.get('/api/*', (req, res) => {
  res.status(404).json({ message: 'API Endpoint not found.' });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
