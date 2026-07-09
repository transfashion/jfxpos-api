# Dokumentasi API Sinkronisasi Salesperson (Salesperson Sync API)

Dokumen ini mendefinisikan API sinkronisasi data salesperson antara server backend dan POS (Point of Sale).

## Keamanan & Autentikasi

Seluruh pemanggilan API wajib menyertakan header keamanan berikut:
* `X-Device-Id`: ID Perangkat POS.
* `X-API-Key`: API Key Perangkat.
* `X-Timestamp`: UTC timestamp (ISO 8601).
* `X-Signature`: Tanda tangan HMAC-SHA256 dari string payload (`JSON.stringify(body) + timestamp`) dengan menggunakan `secret` perangkat sebagai kunci HMAC.
* `X-Site-Code`: Kode Cabang (Site).
* `X-Dept-Code`: Kode Departemen.

---

## 1. Persiapan Sinkronisasi Salesperson (Prepare Salesperson Sync)

Digunakan untuk memulai sesi sinkronisasi data salesperson baru. Server akan menyalin semua data salesperson dengan `datatimestamp` lebih baru atau sama dengan parameter ke tabel staging `salespersonsync`.

* **Endpoint**: `POST /api/possync/prepareSalespersonSyn`
* **Content-Type**: `application/json`

### Request Body
```json
{
  "posdevice_id": 1,
  "client_timestamp": "2026-07-09T08:30:00.000Z",
  "datatimestamp": "2026-07-08T00:00:00.000Z",
  "site_id": 10
}
```
* **site_id** (integer, opsional): Digunakan untuk memfilter salesperson berdasarkan site. Jika tidak diisi, server akan mendeteksi `site_id` dari perangkat POS terautentikasi.
* Gunakan `"datatimestamp": 0` atau `"0"` untuk mengambil seluruh data dari awal.

### Response (201 Created)
```json
{
  "success": true,
  "message": "Persiapan sinkronisasi salesperson berhasil disimpan.",
  "data": {
    "possync_id": 7,
    "rowcount": 100,
    "blockcount": 2
  }
}
```

---

## 2. Ambil Data Halaman Halaman/Blok (Get Salesperson Sync)

Mengambil baris salesperson yang disalin pada sesi sinkronisasi tertentu per halaman/blok. Ukuran default per blok adalah **50 data**.

* **Endpoint**: `GET /api/possync/getSalespersonSync`
* **Query Parameters**:
  - `possync_id` (integer, wajib): ID sesi sinkronisasi dari Step 1.
  - `synblock` (integer, wajib): Nomor blok halaman yang akan diambil (mulai dari 1).

### Response (200 OK)
```json
{
  "success": true,
  "possync_id": 7,
  "synblock": 1,
  "count": 50,
  "data": [
    {
      "salesperson_id": 1,
      "salesperson_nik": "SP001",
      "salesperson_name": "Ahmad Pratama",
      "salesperson_isdisabled": false,
      "brand_id": 1,
      "site_id": 10,
      "datatimestamp": "2026-07-08T17:00:00.000Z",
      "md5hash": "2e3781657243141d27fdd841e468ab8d",
      "synnumber": 1,
      "synblock": 1
    }
  ]
}
```

---

## 3. Selesaikan Proses Sinkronisasi (Finish Salesperson Sync)

Memperbarui status sesi sinkronisasi pada server untuk menandakan apakah proses sinkronisasi berhasil diselesaikan oleh POS atau mengalami kegagalan.

* **Endpoint**: `POST /api/possync/finishSalespersonSync`
* **Content-Type**: `application/json`

### Request Body
```json
{
  "possync_id": 7,
  "is_completed": true,
  "is_error": false,
  "errormessage": ""
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Status sinkronisasi salesperson berhasil diperbarui."
}
```
