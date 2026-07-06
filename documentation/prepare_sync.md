# Dokumentasi API - Prepare Item Sync

Dokumen ini berisi spesifikasi endpoint `prepareItemSyn` yang digunakan oleh aplikasi klien **jfxpos** (Java 25 / JavaFX 25) untuk menginisialisasi proses sinkronisasi data item baru dan mencatatnya ke database.

---

## 📌 Detail Endpoint

* **Nama Endpoint**: Prepare Item Sync
* **Metode HTTP**: `POST`
* **Path**: `/api/items/prepareItemSyn`
* **Format Konten**: JSON

---

## 📥 Spesifikasi Request Header

Setiap pemanggilan API ini wajib menyertakan header keamanan M2M (Machine-to-Machine) berikut:

| Header Key | Tipe | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `X-Device-Code` | String | Kode identifikasi unik perangkat POS | `pos-kasir-01` |
| `X-API-Key` | String | API Key unik perangkat (dari token konfigurasi) | `key_kasir_satu_123` |
| `X-Timestamp` | String | Waktu pengiriman request dalam format UTC (ISO 8601) | `2026-07-06T13:51:02.270Z` |
| `X-Signature` | String | HMAC-SHA256 dari payload `JSON.stringify(body) + timestamp` menggunakan `secret` | `b53f7c32e98fa...` |
| `X-Site-Code` | String | Kode Cabang (Site) tempat kasir beroperasi | `SITE01` |
| `X-Dept-Code` | String | Kode Departemen divisi kasir perangkat POS | `DEPT01` |

---

## 📥 Spesifikasi Request Body

Request Body wajib bertipe JSON dan memuat properti berikut:

| Field Name | Tipe | Deskripsi | Wajib | Contoh |
| :--- | :--- | :--- | :---: | :--- |
| `posdevice_id` | Integer | ID unik perangkat POS di database server | Ya | `1` |
| `client_timestamp` | String | Timestamp waktu pengiriman dari sisi client (ISO 8601 UTC) | Ya | `2026-07-06T13:51:02.270Z` |
| `datatimestamp` | String | Starting timestamp sinkronisasi data item dari sisi client | Ya | `2026-07-06T13:51:02.270Z` |

---

## 📤 Spesifikasi Response

### 1. Skenario Sukses (201 Created)
Dihasilkan jika signature valid, `posdevice_id` cocok dengan identitas M2M pengirim, dan seluruh parameter valid. Data berhasil disimpan ke tabel `possync`.

**Response Body (JSON):**
```json
{
  "success": true,
  "message": "Persiapan sinkronisasi berhasil disimpan.",
  "data": {
    "possync_id": "2"
  }
}
```

### 2. Skenario Gagal - Parameter Tidak Lengkap / Tidak Cocok (400 Bad Request)
Dihasilkan jika ada parameter wajib yang kosong, format timestamp tidak valid, atau `posdevice_id` tidak cocok dengan kredensial pengirim.

**Response Body (JSON):**
```json
{
  "error": "Bad Request",
  "message": "posdevice_id tidak cocok dengan identitas perangkat yang terautentikasi."
}
```

### 3. Skenario Gagal - Signature Tidak Valid (401 Unauthorized)
Dihasilkan jika signature atau timestamp melampaui toleransi waktu (5 menit).

**Response Body (JSON):**
```json
{
  "error": "Unauthorized",
  "message": "Tanda tangan keamanan (Signature) tidak valid. Integritas data tidak terverifikasi."
}
```

---

## ☕ Panduan Implementasi Java Klien (HttpClient Java 25)

Berikut adalah contoh pembuatan signature HMAC-SHA256 dan pengiriman request menggunakan `java.net.http.HttpClient` di Java 25:

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

public class ItemSyncService {
    private static final String API_URL = "http://localhost:3000/api/items/prepareItemSyn";

    private final int posdeviceId = 1;
    private final String deviceCode = "pos-kasir-01";
    private final String apiKey = "key_kasir_satu_123";
    private final String secret = "secret_kasir_satu_999_xyz";
    private final String siteCode = "SITE01";
    private final String deptCode = "DEPT01";

    public void prepareSync(String datatimestampStr) {
        try {
            String clientTimestamp = Instant.now().toString();
            
            // Buat request body JSON
            String jsonBody = String.format(
                "{\"posdevice_id\":%d,\"client_timestamp\":\"%s\",\"datatimestamp\":\"%s\"}",
                posdeviceId, clientTimestamp, datatimestampStr
            );
            
            String timestampHeader = Instant.now().toString();
            String payload = jsonBody + timestampHeader;
            
            // Hitung HMAC-SHA256
            String signature = calculateHmacSha256(payload, secret);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("X-Device-Code", deviceCode)
                    .header("X-API-Key", apiKey)
                    .header("X-Timestamp", timestampHeader)
                    .header("X-Signature", signature)
                    .header("X-Site-Code", siteCode)
                    .header("X-Dept-Code", deptCode)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201) {
                System.out.println("Persiapan Sync Berhasil!");
                System.out.println("Response: " + response.body());
            } else {
                System.err.println("Gagal Persiapan. Status: " + response.statusCode());
                System.err.println("Response: " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String calculateHmacSha256(String data, String key) throws Exception {
        byte[] byteKey = key.getBytes(StandardCharsets.UTF_8);
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(byteKey, "HmacSHA256");
        sha256HMAC.init(keySpec);
        
        byte[] macData = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder result = new StringBuilder();
        for (byte b : macData) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
```
