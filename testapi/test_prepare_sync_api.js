/**
 * Test Script untuk menguji API endpoint: POST /api/possync/prepareItemSyn
 * Endpoint ini terproteksi oleh M2M Signature Verification.
 * Cara menjalankan:
 * 1. Pastikan server Express aktif (`npm run dev` atau `node src/app.js`)
 * 2. Jalankan script ini: `node testapi/test_prepare_sync_api.js`
 */

import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api/possync/prepareItemSyn';

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
    'Content-Type': 'application/json',
    ...customHeaders
  };

  console.log(`Headers sent:`, JSON.stringify(headers, null, 2));
  console.log(`Body sent:`, JSON.stringify(body, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: body ? JSON.stringify(body) : null
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
  console.log('Memulai Pengujian API PREPARE ITEM SYNC dengan Signature...');

  const validBody = {
    posdevice_id: 1,
    client_timestamp: new Date().toISOString(),
    datatimestamp: new Date().toISOString()
  };


  // Test 1c: Skenario Berhasil dengan datatimestamp spesifik 2026-07-05 05:03:32.124
  await runTest('Skenario Sukses - Datatimestamp Spesifik 2026-07-05 05:03:32.124', {}, {
    ...validBody,
    datatimestamp: '2026-07-05 05:03:32.124'
  });



  // // Test 1: Skenario Berhasil (Cocok semua & Signature valid)
  // await runTest('Skenario Sukses - Kredensial & Signature Valid', {}, validBody);

  // // Test 1b: Skenario Berhasil dengan datatimestamp = 0
  // await runTest('Skenario Sukses - Datatimestamp = 0 (Ambil Semua)', {}, {
  //   ...validBody,
  //   datatimestamp: 0
  // });



  // // Test 2: Skenario Gagal - posdevice_id tidak cocok
  // await runTest('Skenario Gagal - posdevice_id Tidak Cocok', {}, {
  //   ...validBody,
  //   posdevice_id: 99
  // });

  // // Test 3: Skenario Gagal - Body parameter tidak lengkap
  // await runTest('Skenario Gagal - Parameter Tidak Lengkap', {}, {
  //   posdevice_id: 1
  //   // client_timestamp & datatimestamp missing
  // });

  // // Test 4: Skenario Gagal - Signature Salah (kunci secret salah)
  // await runTest('Skenario Gagal - Signature Salah (Secret salah)', {}, validBody, 'secret_salah_123');


}

startTests();
