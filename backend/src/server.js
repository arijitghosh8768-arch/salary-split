import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';
import { apiLimiter } from './middleware/security.js';

import authRoutes from './routes/authRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure DB initialization middleware for Serverless Function cold starts
app.use(async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (err) {
    console.error('Failed to initialize database on request:', err);
    res.status(500).json({ error: 'Database Initialization Error' });
  }
});

// Cybersecurity headers & CORS
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SalarySplit Security-Hardened API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SalarySplit Backend running on http://localhost:${PORT}`);
  });
}

export default app;
