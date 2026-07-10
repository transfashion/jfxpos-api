import fs from 'fs';
import path from 'path';
import { db } from '../src/config/db.js';

const ddlPath = path.resolve('ddl/syncitem.sql');

async function run() {
  try {
    console.log('Membaca file DDL...');
    const ddl = fs.readFileSync(ddlPath, 'utf8');

    console.log('Menjalankan migrasi database...');
    await db.none('DROP TABLE IF EXISTS syncitem CASCADE;');
    await db.none(ddl);
    console.log('Migrasi skema database syncitem berhasil!');
  } catch (error) {
    console.error('Gagal menjalankan migrasi DDL syncitem:', error);
  } finally {
    process.exit();
  }
}

run();
