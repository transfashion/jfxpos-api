import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise({
  // Opsi inisialisasi pg-promise jika ada
});

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'jfxpos',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 16, // Batas maksimum connection pool diatur ke 16
  idleTimeoutMillis: 30000
};

const db = pgp(config);

export { db, pgp };
