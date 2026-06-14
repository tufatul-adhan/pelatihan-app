const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const createUser = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pelatihan'
  });

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await connection.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test User', 'test@example.com', hashedPassword, 'user']
    );
    
    console.log('✅ User berhasil dibuat!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ User sudah ada');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await connection.end();
  }
};

createUser();
