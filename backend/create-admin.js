const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error('Set ADMIN_EMAIL dan ADMIN_PASSWORD sebelum menjalankan npm run db:create-admin.');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'db_pelatihan',
});

async function createAdmin() {
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (nama, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
      [process.env.ADMIN_NAME || 'Administrator', email, hash]
    );
    console.log(`Akun admin siap: ${email}`);
  } finally {
    await pool.end();
  }
}

createAdmin().catch((error) => {
  console.error('Gagal membuat admin:', error.message);
  process.exitCode = 1;
});
