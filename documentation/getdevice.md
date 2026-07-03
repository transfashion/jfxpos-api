# Dokumentasi API - Get Device

Dokumen ini berisi spesifikasi endpoint `getdevice` yang digunakan oleh aplikasi klien **jfxpos** (Java 25 / JavaFX 25) untuk menginisialisasi atau memverifikasi detail perangkat POS.

---

## 📌 Detail Endpoint

* **Nama Endpoint**: Get Device
* **Metode HTTP**: `GET`
* **Path**: `/api/pos/getdevice`
* **Format Konten**: JSON

---

## 📥 Spesifikasi Request Header

Setiap pemanggilan API ini wajib menyertakan header keamanan M2M (Machine-to-Machine) berikut:

| Header Key | Tipe | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `X-Device-Code` | String | Kode identifikasi unik perangkat POS | `pos-kasir-01` |
| `X-API-Key` | String | API Key unik perangkat (dari token konfigurasi) | `key_kasir_satu_123` |
| `X-Timestamp` | String | Waktu pengiriman request dalam format UTC (ISO 8601) | `2026-07-03T06:59:41.558Z` |
| `X-Signature` | String | HMAC-SHA256 dari payload `"" + timestamp` menggunakan `secret` | `0a91edaf85f69dbf423...` |
| `X-Site-Code` | String | Kode Cabang (Site) tempat kasir beroperasi | `SITE01` |
| `X-Dept-Code` | String | Kode Departemen divisi kasir perangkat POS | `DEPT01` |

> [!NOTE]
> Karena request GET ini tidak memiliki Request Body, maka string payload yang dijadikan parameter HMAC adalah: `"" + timestamp` (atau `"{}" + timestamp`).

---

## 📤 Spesifikasi Response

### 1. Skenario Sukses (200 OK)
Dihasilkan jika signature valid, `deviceCode` ditemukan, serta kombinasi `siteCode` dan `structCode` (didapatkan dari `X-Dept-Code`) yang dikirimkan **COCOK** dengan yang ada di database.

**Response Body (JSON):**
```json
{
  "success": true,
  "data": {
    "device_id": 1,
    "device_code": "pos-kasir-01",
    "api_key": "key_kasir_satu_123",
    "secret": "secret_kasir_satu_999_xyz",
    "name": "POS Kasir Utama",
    "site_id": 10,
    "site_code": "SITE01",
    "site_name": "Bandung Indah Plaza",
    "struct_id": 20,
    "struct_code": "DEPT01",
    "is_active": true,
    "created_at": "2026-07-02T23:42:55.895Z",
    "datatimestamp": "2026-07-02T23:42:55.895Z"
  }
}
```

### 2. Skenario Gagal - Site Code atau Struct Code Tidak Cocok (400 Bad Request)
Dihasilkan jika data device ditemukan tetapi input `X-Site-Code` atau `X-Dept-Code` tidak cocok dengan record database.

**Response Body (JSON):**
```json
{
  "error": "Bad Request",
  "message": "Kombinasi Site Code atau Struct Code tidak cocok dengan data perangkat."
}
```

### 3. Skenario Gagal - Kredensial / Signature Tidak Valid (401 Unauthorized)
Dihasilkan jika signature yang dihitung tidak cocok atau timestamp melampaui toleransi waktu (5 menit).

**Response Body (JSON):**
```json
{
  "error": "Unauthorized",
  "message": "Tanda tangan keamanan (Signature) tidak valid. Integritas data tidak terverifikasi."
}
```

---

## ☕ Panduan Implementasi Java Klien (HttpClient Java 25)

Berikut adalah contoh referensi pembuatan signature HMAC-SHA256 dan pengiriman request menggunakan `java.net.http.HttpClient` di Java 25:

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

public class PosDeviceService {
    private static final String API_URL = "http://localhost:3000/api/pos/getdevice";

    // Kredensial yang didapatkan dari hasil parsing token konfigurasi lokal client
    private final String deviceCode = "pos-kasir-01";
    private final String apiKey = "key_kasir_satu_123";
    private final String secret = "secret_kasir_satu_999_xyz";
    private final String siteCode = "SITE01";
    private final String deptCode = "DEPT01";

    public void verifyDevice() {
        try {
            String timestamp = Instant.now().toString(); // ISO 8601 UTC format
            String payload = "{}" + timestamp; // GET request body bernilai kosong / "{}"
            
            // Hitung HMAC-SHA256
            String signature = calculateHmacSha256(payload, secret);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .GET()
                    .header("X-Device-Code", deviceCode)
                    .header("X-API-Key", apiKey)
                    .header("X-Timestamp", timestamp)
                    .header("X-Signature", signature)
                    .header("X-Site-Code", siteCode)
                    .header("X-Dept-Code", deptCode)
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("Koneksi & Kredensial POS Valid!");
                System.out.println("Response: " + response.body());
            } else {
                System.err.println("Gagal Verifikasi. Status: " + response.statusCode());
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
        
        // Convert to Hex
        StringBuilder result = new StringBuilder();
        for (byte b : macData) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
```
