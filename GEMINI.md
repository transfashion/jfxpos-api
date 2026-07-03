# Panduan Pengembangan AI - JFXPOS API

Dokumen ini berisi pedoman dan instruksi wajib bagi AI / developer dalam mengembangkan project backend **JFXPOS API**. Harap ikuti aturan-aturan di bawah ini secara konsisten.

## ℹ️ Tentang Project

Project **JFXPOS API** ini merupakan backend API untuk aplikasi **jfxpos**.
* **jfxpos** adalah program Point of Sale (POS) berbasis desktop yang dibangun menggunakan **Java 25** dan **JavaFX 25**.
* Aplikasi utama **jfxpos** menggunakan database **FirebirdSQL 5.04**.
* Backend API ini (**JFXPOS API**) bertindak sebagai perantara/pendukung dengan basis data utama tersendiri menggunakan **PostgreSQL**.

---

## 🛠️ Stack Teknologi

1. **Runtime & Framework**: [Node.js](https://nodejs.org/) dengan [ExpressJS](https://expressjs.com/)
2. **Database**: PostgreSQL
3. **Database Client / Driver**: [pg-promise](https://github.com/vitaly-t/pg-promise)
4. **Environment Variables**: [dotenv](https://github.com/motdotla/dotenv)

---

## 📌 Aturan & Konvensi Wajib

### 1. Sintaksis ES6+ (ECMAScript 6)
Seluruh kode JavaScript wajib menggunakan standar sintaksis **ES6+**. Jangan menggunakan sintaksis CommonJS lama (`require` atau `module.exports`).
* Gunakan `import` dan `export` (ES Modules).
* Gunakan deklarasi variabel modern (`const`, `let`) dan hindari `var`.
* Manfaatkan fitur modern seperti Arrow Functions, Destructuring, Template Literals, Async/Await, dan Promises.

*Contoh Struktur Import:*
```javascript
import express from 'express';
import pgPromise from 'pg-promise';
```

### 2. Koneksi Database (pg-promise) & Connection Pool
Konfigurasi database harus diinisialisasi menggunakan `pg-promise` dengan ukuran **Connection Pool maksimum 16**.

*Contoh Inisialisasi Database (`db.js`):*
```javascript
import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise({
  // Opsi inisialisasi pg-promise jika ada
});

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 16, // Batas maksimum connection pool diatur ke 16
  idleTimeoutMillis: 30000
};

const db = pgp(config);

export { db, pgp };
```

### 3. Manajemen Konfigurasi & Kredensial (`.env`)
* Semua variabel konfigurasi sensitif (kredensial database, port aplikasi, jwt secret, dll.) **WAJIB** disimpan dalam file `.env`.
* File `.env` **TIDAK BOLEH** di-commit ke Git. Pastikan `.env` terdaftar di `.gitignore`.
* Sediakan file `.env.example` sebagai template/dokumentasi variabel lingkungan yang dibutuhkan oleh project.

*Contoh isi `.env`:*
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jfxpos
DB_USER=postgres
DB_PASSWORD=secretpassword
```

### 4. Pemisahan Logika Database (Database Contract & Repository Pattern)
* **DILARANG KERAS** melakukan query database secara langsung di dalam API routes atau controllers.
* Seluruh operasi database wajib dipisahkan menggunakan pattern:
  * **Database Contract (Model/Schema)**: Mendefinisikan kontrak data, nama tabel, kolom, atau schema entitas.
  * **Repository**: Berisi implementasi fungsi query SQL menggunakan `pg-promise` (misal: `findById`, `create`, `update`, dll.).
* Controller hanya boleh berinteraksi dengan Repository untuk membaca/menulis data.

### 5. Keamanan & Autentikasi (Machine-to-Machine API Key & Signature Verification)
* Otorisasi pemanggilan API oleh aplikasi POS menggunakan metode **Machine-to-Machine (M2M) API Key** dengan verifikasi integritas data (*Request Signing*).
* Setiap mesin POS memiliki kredensial unik. Database pusat menyimpan data pasangan antara `deviceId`, `apiKey`, dan `secret` masing-masing POS.
* Setiap request wajib melampirkan header berikut:
  * `X-Device-Id`: ID unik perangkat POS.
  * `X-API-Key`: API Key unik perangkat.
  * `X-Timestamp`: Waktu pengiriman request dalam format UTC (ISO 8601).
  * `X-Signature`: Tanda tangan HMAC-SHA256 dari string payload (`JSON.stringify(body) + timestamp`) dengan menggunakan `secret` perangkat sebagai kunci HMAC.
  * `X-Site-Code`: Kode Cabang (Site) tempat perangkat POS beroperasi.
  * `X-Dept-Code`: Kode Departemen divisi kasir perangkat POS.
* **Validasi Toleransi Waktu**: Rentang toleransi timestamp yang diterima server dibatasi untuk menghindari replay attack (default: 5 menit). Toleransi waktu ini dapat dikonfigurasi di `.env` melalui variabel `TIMESTAMP_TOLERANCE_MINUTES`.
* Proses pencocokan kredensial ke database serta validasi signature ditangani sepenuhnya oleh middleware autentikasi menggunakan **Repository** terkait.




---

## 📂 Struktur Project yang Direkomendasikan
```text
jfxpos-api/
├── src/
│   ├── config/
│   │   └── db.js            # Inisialisasi pg-promise & pool
│   ├── contracts/           # Skema / Kontrak data / Model entitas
│   ├── repositories/        # Implementasi query database (Repository)
│   ├── middlewares/         # Middleware autentikasi/keamanan (M2M API Key)
│   ├── controllers/         # Logika request/response (memanggil repository)
│   ├── routes/              # Routing ExpressJS
│   └── app.js               # Entry point aplikasi Express (ES6)
├── .env                     # File konfigurasi lokal (di-ignore)
├── .env.example             # Template konfigurasi env
├── .gitignore               # Daftar file yang di-ignore git
├── package.json             # Pastikan "type": "module" untuk mengaktifkan ES6 Modules
└── GEMINI.md                # Dokumen panduan ini
```

---

> [!IMPORTANT]
> Selalu pastikan `"type": "module"` dikonfigurasi di file [package.json](file:///Volumes/Development/transfashion/jfxpos-api/package.json) agar runtime Node.js mendukung sintaksis ES Modules secara native tanpa kompilasi/transpilasi tambahan.


