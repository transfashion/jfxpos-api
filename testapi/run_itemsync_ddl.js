import fs from 'fs';
import path from 'path';
import { db } from '../src/config/db.js';

const ddlPath = path.resolve('ddl/create_itemsync.sql');

async function run() {
  try {
    console.log('Membaca file DDL...');
    const ddl = fs.readFileSync(ddlPath, 'utf8');

    console.log('Menjalankan migrasi database...');
    await db.none('DROP TABLE IF EXISTS itemsync CASCADE;');
    await db.none(ddl);
    console.log('Migrasi skema database itemsync berhasil!');
  } catch (error) {
    console.error('Gagal menjalankan migrasi DDL itemsync:', error);
  } finally {
    process.exit();
  }
}

run();
