const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'db_pelatihan',
});

async function createUser() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await pool.query(
      `INSERT INTO users (nama, email, password, role)
       VALUES ($1, $2, $3, 'user') ON CONFLICT (email) DO NOTHING`,
      ['Test User', 'test@example.com', hash]
    );
    console.log('Akun uji tersedia: test@example.com');
  } finally {
    await pool.end();
  }
}

createUser().catch((error) => {
  console.error('Gagal membuat user uji:', error.message);
  process.exitCode = 1;
});
