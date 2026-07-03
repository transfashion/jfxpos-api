# Dokumentasi API - Customer

Dokumen ini berisi spesifikasi API Endpoint untuk entitas **Customer** di **JFXPOS API**. Seluruh endpoint pada router ini memerlukan otorisasi Machine-to-Machine (M2M) API Key & Signature.

---

## 🔒 Kebijakan Keamanan & Header Wajib

Setiap request ke endpoint Customer wajib menyertakan header keamanan berikut:

| Header Key | Tipe | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `X-Device-Code` | String | Kode identifikasi unik perangkat POS | `pos-kasir-01` |
| `X-API-Key` | String | API Key unik perangkat | `key_kasir_satu_123` |
| `X-Timestamp` | String | Waktu pengiriman request dalam format UTC (ISO 8601) | `2026-07-03T10:14:30.381Z` |
| `X-Signature` | String | HMAC-SHA256 dari payload `"" + timestamp` menggunakan `secret` | `74d9c51ae50d22f68...` |
| `X-Site-Code` | String | Kode Cabang (Site) tempat perangkat POS beroperasi | `SITE01` |
| `X-Dept-Code` | String | Kode Departemen divisi kasir perangkat POS | `DEPT01` |

> [!NOTE]
> Karena request GET ini tidak memiliki Request Body, maka string payload yang dijadikan parameter HMAC adalah: `"" + timestamp` (atau `"{}" + timestamp`).

---

## 📌 Rangkuman Endpoint

1. **Daftar Customer (Paginated)**: `GET /api/customers`
2. **Pencarian Customer (Paginated & Filter)**: `GET /api/customers/search`
3. **Detail Customer**: `GET /api/customers/:id`

---

## 📂 Detail Spesifikasi Endpoint

### 1. Daftar Customer (Paginated)
Mengambil daftar customer terdaftar di sistem dengan pembatasan paging untuk keamanan performa server.

* **Path**: `/api/customers`
* **Metode HTTP**: `GET`
* **Query Parameters**:
  * `offset` (Opsional, Default: `0`): Indeks awal pemotongan data.
* **Catatan Performa**: Nilai `limit` dikunci secara internal pada server sebesar **20** baris per request.

**Contoh Response Sukses (200 OK):**
```json
{
  "success": true,
  "limit": 20,
  "offset": 0,
  "count": 2,
  "data": [
    {
      "customer_id": "1001",
      "customer_name": "Ahmad Fauzi",
      "customer_disc": "0.00",
      "customer_disc_datestart": null,
      "customer_disc_dateend": null,
      "customertype_id": 1,
      "customer_gender": 1,
      "customer_birthdate": "1990-05-13T17:00:00.000Z",
      "customer_isdisabled": false,
      "datatimestamp": "2026-07-03T03:38:17.459Z",
      "customertype_name": "Regular"
    },
    {
      "customer_id": "1002",
      "customer_name": "Budi Santoso",
      "customer_disc": "0.10",
      "customer_disc_datestart": "2025-12-31T17:00:00.000Z",
      "customer_disc_dateend": "2026-12-30T17:00:00.000Z",
      "customertype_id": 3,
      "customer_gender": 1,
      "customer_birthdate": "1985-08-21T17:00:00.000Z",
      "customer_isdisabled": false,
      "datatimestamp": "2026-07-03T03:38:17.459Z",
      "customertype_name": "VIP Gold"
    }
  ]
}
```

---

### 2. Pencarian Customer (Paginated & Filter)
Mencari customer berdasarkan pencarian teks. Pencarian ini bersifat cerdas karena dapat mendeteksi pencarian nama maupun pencarian sisa angka ID customer.

* **Path**: `/api/customers/search`
* **Metode HTTP**: `GET`
* **Query Parameters**:
  * `searchtext` (Wajib): Kata kunci pencarian.
    * Jika berupa teks/kata, mencari nama customer yang cocok (`LIKE %searchtext%`).
    * Jika berupa angka, mencocokkan **4 digit terakhir** dari `customer_id` customer (`LIKE %searchtext`).
  * `offset` (Opsional, Default: `0`): Indeks awal pemotongan data.
* **Catatan Performa**: Nilai `limit` dikunci secara internal pada server sebesar **20** baris per request.

**Contoh Request (Mencari Yura Yunita berdasarkan 4 digit terakhir ID '1048'):**
`GET /api/customers/search?offset=0&searchtext=1048`

**Contoh Response Sukses (200 OK):**
```json
{
  "success": true,
  "limit": 20,
  "offset": 0,
  "count": 1,
  "data": [
    {
      "customer_id": "1048",
      "customer_name": "Yura Yunita",
      "customer_disc": "0.15",
      "customer_disc_datestart": "2025-12-31T17:00:00.000Z",
      "customer_disc_dateend": "2026-12-30T17:00:00.000Z",
      "customertype_id": 2,
      "customer_gender": 2,
      "customer_birthdate": "1991-06-08T17:00:00.000Z",
      "customer_isdisabled": false,
      "datatimestamp": "2026-07-03T03:38:17.459Z",
      "customertype_name": "VIP Platinum"
    }
  ]
}
```

---

### 3. Detail Customer
Mengambil satu record data customer secara spesifik berdasarkan ID uniknya.

* **Path**: `/api/customers/:id`
* **Metode HTTP**: `GET`
* **Path Parameters**:
  * `id` (Wajib): ID unik customer (`customer_id` bertipe BIGINT).

**Contoh Request**:
`GET /api/customers/1002`

**Contoh Response Sukses (200 OK):**
```json
{
  "success": true,
  "data": {
    "customer_id": "1002",
    "customer_name": "Budi Santoso",
    "customer_disc": "0.10",
    "customer_disc_datestart": "2025-12-31T17:00:00.000Z",
    "customer_disc_dateend": "2026-12-30T17:00:00.000Z",
    "customertype_id": 3,
    "customer_gender": 1,
    "customer_birthdate": "1985-08-21T17:00:00.000Z",
    "customer_isdisabled": false,
    "datatimestamp": "2026-07-03T03:38:17.459Z",
    "customertype_name": "VIP Gold"
  }
}
```

**Contoh Response Gagal - ID Tidak Ditemukan (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Customer dengan ID '9999' tidak ditemukan."
}
```
