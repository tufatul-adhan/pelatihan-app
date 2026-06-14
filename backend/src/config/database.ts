// src/config/database.ts

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_pelatihan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const getConnection = async () => {
  return pool.getConnection();
};

export const query = async <T = any>(sql: string, values?: any[]): Promise<T> => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values || []);
    return results as T;
  } finally {
    connection.release();
  }
};

export default pool;
