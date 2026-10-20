const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'db_pelatihan',
});

const trainings = [
  [
    'Karakter Building',
    'Program untuk membangun karakter, disiplin, etika, tanggung jawab, dan kerja sama peserta melalui materi dan aktivitas terarah.',
  ],
  [
    'Outbond',
    'Kegiatan luar ruang yang mendorong komunikasi, kekompakan tim, kepercayaan diri, dan kemampuan bekerja sama. Bentuk kegiatan disesuaikan dengan kebutuhan peserta.',
  ],
  [
    'Leadership',
    'Pelatihan dasar kepemimpinan untuk mengembangkan komunikasi, tanggung jawab, pengambilan keputusan, dan kemampuan mengarahkan tim.',
  ],
  [
    'Basic Mentality',
    'Pembinaan mental dasar yang menekankan disiplin, integritas, ketahanan diri, etika, serta kesiapan menjalankan tanggung jawab.',
  ],
  [
    'LDKS',
    'Latihan Dasar Kepemimpinan Siswa untuk melatih jiwa kepemimpinan, kedisiplinan, tanggung jawab, kerja sama, dan wawasan kebangsaan.',
  ],
];

async function seedDatabase() {
  try {
    let inserted = 0;
    for (const [name, description] of trainings) {
      const result = await pool.query(
        `INSERT INTO pelatihan (nama_pelatihan, deskripsi, harga, duration, tanggal)
         SELECT $1, $2, 0, 'Disesuaikan', CURRENT_TIMESTAMP
         WHERE NOT EXISTS (
           SELECT 1 FROM pelatihan WHERE LOWER(nama_pelatihan) = LOWER($1::varchar)
         )
         RETURNING id`,
        [name, description]
      );
      inserted += result.rowCount || 0;
    }
    console.log(`${inserted} program mockup ditambahkan; harga ditandai Hubungi kami.`);
  } finally {
    await pool.end();
  }
}

seedDatabase().catch((error) => {
  console.error('Gagal mengisi data contoh:', error.message);
  process.exitCode = 1;
});
