const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pelatihan',
  });

  try {
    console.log('Seeding database...');

    // Add sample admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT IGNORE INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@pelatihan.com', hashedPassword, 'admin']
    );
    console.log('✅ Admin user created');

    // Add sample training data
    const trainings = [
      {
        nama_pelatihan: 'Leadership & Management',
        deskripsi: 'Program pelatihan kepemimpinan dan manajemen untuk meningkatkan skill kepemimpinan Anda dalam organisasi.',
        harga: 5000000,
        duration: '3 hari',
        tanggal: new Date('2026-07-15 09:00:00'),
      },
      {
        nama_pelatihan: 'Digital Marketing Essentials',
        deskripsi: 'Pelajari strategi digital marketing terkini untuk meningkatkan brand awareness dan penjualan bisnis Anda.',
        harga: 3500000,
        duration: '2 hari',
        tanggal: new Date('2026-07-20 09:00:00'),
      },
      {
        nama_pelatihan: 'Data Analysis & Business Intelligence',
        deskripsi: 'Kuasai teknik analisis data dan business intelligence untuk membuat keputusan bisnis yang lebih baik.',
        harga: 6000000,
        duration: '4 hari',
        tanggal: new Date('2026-08-01 09:00:00'),
      },
      {
        nama_pelatihan: 'Public Speaking & Presentation',
        deskripsi: 'Tingkatkan kemampuan public speaking dan presentasi Anda agar lebih percaya diri dan efektif.',
        harga: 2500000,
        duration: '2 hari',
        tanggal: new Date('2026-07-25 09:00:00'),
      },
      {
        nama_pelatihan: 'Project Management Professional',
        deskripsi: 'Sertifikasi PMP untuk mengelola proyek secara profesional dan efisien sesuai standar internasional.',
        harga: 7500000,
        duration: '5 hari',
        tanggal: new Date('2026-08-10 09:00:00'),
      },
    ];

    for (const training of trainings) {
      await connection.query(
        'INSERT IGNORE INTO pelatihan (nama_pelatihan, deskripsi, harga, duration, tanggal) VALUES (?, ?, ?, ?, ?)',
        [
          training.nama_pelatihan,
          training.deskripsi,
          training.harga,
          training.duration,
          training.tanggal,
        ]
      );
    }
    console.log('✅ Sample trainings added successfully!');

    console.log('\n✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

seedDatabase();
