const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pelatihan'
  });

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', hashedPassword, 'admin']
    );
    
    console.log('✅ Admin user berhasil dibuat!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\nAkses admin di: http://localhost:3000/admin');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Admin user sudah ada');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('\nAkses admin di: http://localhost:3000/admin');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await connection.end();
  }
};

createAdminUser();
