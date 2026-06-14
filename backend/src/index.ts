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

const ensureDatabaseSchema = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'ALTER TABLE pelatihan ADD COLUMN duration VARCHAR(120) NULL AFTER harga'
    );
    console.log('Database schema updated: pelatihan.duration created');
  } catch (error: any) {
    // MySQL ER_DUP_FIELDNAME = 1060 (column already exists)
    if (error?.errno !== 1060) {
      console.error('Failed to ensure pelatihan.duration column:', error?.message || error);
    }
  } finally {
    connection.release();
  }
};

// Start server
app.listen(PORT, async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Database connection successful');
    await ensureDatabaseSchema();
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  console.log(`Training Service Backend API running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

export default app;
