import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import appRoutes from './routes/applications.js';
import reqRoutes from './routes/requirements.js';
import docRoutes from './routes/documents.js';
import remRoutes from './routes/reminders.js';
import migRoutes from './routes/migration.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', generalLimiter);

// Root health check / status route
app.get('/', (req, res) => {
  res.json({
    name: 'FormLens API',
    status: 'online',
    version: '1.0.0',
    documentation: 'All API routes are mounted under /api/*'
  });
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/applications', appRoutes);
app.use('/api', reqRoutes);
app.use('/api', docRoutes);
app.use('/api', remRoutes);
app.use('/api/migration', migRoutes);

app.use(errorHandler);

export default app;
