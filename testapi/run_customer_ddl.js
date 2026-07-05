import fs from 'fs';
import path from 'path';
import { db } from '../src/config/db.js';

const ddlPath = path.resolve('ddl/create_customer.sql');

async function run() {
  try {
    console.log('Membaca file DDL Customer...');
    const ddl = fs.readFileSync(ddlPath, 'utf8');

    console.log('Menjalankan migrasi database customer...');
    await db.none('DROP TABLE IF EXISTS customer CASCADE;');
    await db.none('DROP TABLE IF EXISTS customertype CASCADE;');
    await db.none(ddl);
    console.log('Migrasi skema database customer berhasil!');
  } catch (error) {
    console.error('Gagal menjalankan migrasi DDL Customer:', error);
  } finally {
    process.exit();
  }
}

run();
