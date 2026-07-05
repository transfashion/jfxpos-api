import fs from 'fs';
import path from 'path';
import { db } from '../src/config/db.js';

const ddlPath = path.resolve('ddl/create_posdevice.sql');

async function run() {
  try {
    console.log('Membaca file DDL...');
    const ddl = fs.readFileSync(ddlPath, 'utf8');

    console.log('Menjalankan migrasi database...');
    // Jalankan drop table jika skema berubah drastis
    await db.none('DROP TABLE IF EXISTS posdevice CASCADE;');
    await db.none(ddl);
    console.log('Migrasi skema database berhasil!');
  } catch (error) {
    console.error('Gagal menjalankan migrasi DDL:', error);
  } finally {
    process.exit();
  }
}

run();
