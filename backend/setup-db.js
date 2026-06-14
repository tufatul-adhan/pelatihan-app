const mysql = require('mysql2/promise');

const setupDatabase = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });

  try {
    console.log('Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS db_pelatihan');
    console.log('✅ Database created');

    await connection.changeUser({ database: 'db_pelatihan' });

    console.log('Creating tables...');
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    // Pelatihan table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pelatihan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama_pelatihan VARCHAR(255) NOT NULL,
        deskripsi TEXT NOT NULL,
        harga DECIMAL(12, 2) NOT NULL,
        duration VARCHAR(120) NULL,
        tanggal DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tanggal (tanggal),
        INDEX idx_harga (harga)
      )
    `);

    // Permintaan table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permintaan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        pelatihan_id INT NOT NULL,
        jumlah_peserta INT NOT NULL,
        deskripsi TEXT,
        status ENUM('pending', 'diproses', 'ditolak', 'selesai') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (pelatihan_id) REFERENCES pelatihan(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_pelatihan_id (pelatihan_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

setupDatabase();
