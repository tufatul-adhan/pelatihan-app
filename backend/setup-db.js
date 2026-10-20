const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
};
const database = process.env.DB_NAME || 'db_pelatihan';

async function setupDatabase() {
  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD belum diisi di backend/.env. Isi dengan password akun PostgreSQL.');
  }
  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  try {
    const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (existing.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${database.replace(/"/g, '""')}"`);
      console.log(`Database '${database}' dibuat.`);
    } else {
      console.log(`Database '${database}' sudah ada.`);
    }
  } finally {
    await admin.end();
  }

  const pool = new Pool({ ...config, database });
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    await pool.query(schema);
    console.log('Tabel users, pelatihan, dan permintaan siap digunakan.');
  } finally {
    await pool.end();
  }
}

setupDatabase().catch((error) => {
  console.error('Gagal menyiapkan PostgreSQL:', error.message);
  process.exitCode = 1;
});
