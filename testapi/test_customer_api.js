/**
 * Test Script untuk menguji API endpoint Customer:
 * - GET /api/customers
 * - GET /api/customers/:id
 * Cara menjalankan:
 * 1. Pastikan server Express aktif (`node src/app.js`)
 * 2. Jalankan: `node testapi/test_customer_api.js`
 */

import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000/api/customers';

// Kredensial lokal POS Device yang valid di DB
const CLIENT_CONFIG = {
  deviceCode: 'pos-kasir-01',
  apiKey: 'key_kasir_satu_123',
  secret: 'secret_kasir_satu_999_xyz',
  siteCode: 'SITE01',
  deptCode: 'DEPT01'
};

async function runTest(testName, path = '', customHeaders = {}) {
  console.log(`\n========================================`);
  console.log(`[TEST]: ${testName}`);

  const timestamp = new Date().toISOString();
  
  // Hitung Signature HMAC-SHA256 (payload stringified body {} + timestamp)
  const payload = JSON.stringify({}) + timestamp;
  const signature = crypto
    .createHmac('sha256', CLIENT_CONFIG.secret)
    .update(payload)
    .digest('hex');

  const headers = {
    'x-device-code': CLIENT_CONFIG.deviceCode,
    'x-api-key': CLIENT_CONFIG.apiKey,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'x-site-code': CLIENT_CONFIG.siteCode,
    'x-dept-code': CLIENT_CONFIG.deptCode,
    ...customHeaders
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: headers
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status Response: ${status}`);
    if (status === 200 && data.data && Array.isArray(data.data)) {
      console.log(`Data Response: [Menampilkan 2 dari ${data.data.length} customer]`, JSON.stringify(data.data.slice(0, 2), null, 2));
    } else {
      console.log(`Data Response:`, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(`Result: ERROR KONEKSI SERVER`, error.message);
  }
}

async function startTests() {
  console.log('Memulai Pengujian API Customer...');

  // Test 1: Mendapatkan semua customer
  await runTest('Daftar Semua Customer', '/');

  // Test 2: Mendapatkan customer berdasarkan ID 1002 (Budi Santoso)
  await runTest('Customer Detail ID 1002', '/1002');

  // Test 3: Mendapatkan customer detail dengan ID salah
  await runTest('Customer Detail ID Salah (9999)', '/9999');

  // Test 4: Pencarian Paging berdasarkan Nama
  await runTest('Pencarian Paging (searchtext=budi)', '/search?offset=0&searchtext=budi');

  // Test 5: Pencarian Paging berdasarkan 4 Digit Terakhir ID
  await runTest('Pencarian Paging (searchtext=1048)', '/search?offset=0&searchtext=1048');
}

startTests();
