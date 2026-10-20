import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pelatihanRoutes from './routes/pelatihanRoutes';
import permintaanRoutes from './routes/permintaanRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import pool from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pelatihan', pelatihanRoutes);
app.use('/api/permintaan', permintaanRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Verify PostgreSQL before opening the API port so a database outage cannot
// make the backend appear ready while every database endpoint is failing.
const startServer = async (): Promise<void> => {
  try {
    if (!process.env.DB_PASSWORD) {
      throw new Error('DB_PASSWORD belum diisi di backend/.env. Isi dengan password akun PostgreSQL.');
    }
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Training Service Backend API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', (error as Error).message || error);
    await pool.end();
    process.exitCode = 1;
  }
};

void startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

export default app;
