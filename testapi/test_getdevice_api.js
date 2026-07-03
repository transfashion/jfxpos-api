/**
 * Test Script untuk menguji API endpoint: GET /api/pos/getdevice
 * Endpoint ini terproteksi oleh M2M Signature Verification.
 * Cara menjalankan:
 * 1. Pastikan server Express aktif (`npm run dev` atau `node src/app.js`)
 * 2. Jalankan script ini: `node testapi/test_getdevice.js`
 */

import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api/pos/getdevice';

// Kredensial lokal (simulasi parsing dari config token di sisi client)
const CLIENT_CONFIG = {
  deviceCode: 'pos-kasir-01',
  apiKey: 'key_kasir_satu_123',
  secret: 'secret_kasir_satu_999_xyz',
  siteCode: 'SITE01',
  deptCode: 'DEPT01'
};

async function runTest(testName, customHeaders = {}, body = null, secretKey = CLIENT_CONFIG.secret) {
  console.log(`\n========================================`);
  console.log(`[TEST]: ${testName}`);

  const timestamp = new Date().toISOString();
  
  // Hitung Signature HMAC-SHA256
  const payload = JSON.stringify(body || {}) + timestamp;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  // Susun header default
  const headers = {
    'x-device-code': CLIENT_CONFIG.deviceCode,
    'x-api-key': CLIENT_CONFIG.apiKey,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'x-site-code': CLIENT_CONFIG.siteCode,
    'x-dept-code': CLIENT_CONFIG.deptCode,
    ...customHeaders
  };

  console.log(`Headers sent:`, JSON.stringify(headers, null, 2));
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status Response: ${status}`);
    console.log(`Data Response:`, JSON.stringify(data, null, 2));
    
    if (status >= 200 && status < 300) {
      console.log(`Result: SUCCESS (Valid match)`);
    } else {
      console.log(`Result: EXPECTED ERROR/FAIL (${data.error || 'Failed'})`);
    }
  } catch (error) {
    console.error(`Result: ERROR KONEKSI SERVER (Apakah server sudah dijalankan?)`, error.message);
  }
}

async function startTests() {
  console.log('Memulai Pengujian API GET DEVICE dengan Signature...');

  // Test 1: Skenario Berhasil (Cocok semua & Signature valid)
  await runTest('Skenario Sukses - Kredensial & Signature Valid', {});

  // Test 2: Skenario Gagal - Signature Salah (kunci secret salah)
  await runTest('Skenario Gagal - Signature Salah (Secret salah)', {}, null, 'secret_salah_123');

  // Test 3: Skenario Gagal - Site Code Tidak Cocok
  await runTest('Skenario Gagal - Site Code Tidak Cocok', {
    'x-site-code': 'SITE_SALAH'
  });

  // Test 4: Skenario Gagal - Struct Code (Dept Code) Tidak Cocok
  await runTest('Skenario Gagal - Struct Code Tidak Cocok', {
    'x-dept-code': 'DEPT_SALAH'
  });

  // Test 5: Skenario Gagal - Timestamp Kedaluwarsa (Replay Attack)
  const oldTimestamp = new Date(Date.now() - 10 * 60000).toISOString(); // 10 menit yang lalu
  const oldPayload = JSON.stringify({}) + oldTimestamp;
  const oldSignature = crypto
    .createHmac('sha256', CLIENT_CONFIG.secret)
    .update(oldPayload)
    .digest('hex');

  await runTest('Skenario Gagal - Timestamp Kedaluwarsa (10 menit lalu)', {
    'x-timestamp': oldTimestamp,
    'x-signature': oldSignature
  });
}

startTests();
