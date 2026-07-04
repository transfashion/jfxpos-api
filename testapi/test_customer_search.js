/**
 * Test Script untuk menguji API endpoint Customer Search:
 * - GET /api/customers/search
 * 
 * Skenario Pengujian:
 * 1. Sukses mencari customer berdasarkan nama (contoh: 'budi')
 * 2. Sukses mencari customer berdasarkan 4 digit terakhir ID (contoh: '1048' / '1002')
 * 3. Sukses mencari customer tanpa menyertakan searchtext (kembali ke list default / kosong)
 * 4. Sukses mencari customer dengan parameter paging (offset)
 * 5. Error ketika API Key tidak valid (401 Unauthorized)
 * 6. Error ketika Signature tidak valid (401 Unauthorized)
 * 7. Error ketika Timestamp kadaluarsa / expired (401 Unauthorized)
 * 
 * Cara menjalankan:
 * 1. Pastikan server Express aktif (`npm run dev` atau `node src/app.js`)
 * 2. Jalankan: `node testapi/test_customer_search.js`
 */

import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000/api/customers/search';

// Kredensial lokal POS Device yang valid di DB (sesuai data seeding / test_customer_api.js)
const CLIENT_CONFIG = {
  deviceCode: 'pos-kasir-01',
  apiKey: 'key_kasir_satu_123',
  secret: 'secret_kasir_satu_999_xyz',
  siteCode: 'SITE01',
  deptCode: 'DEPT01'
};

async function runSearchTest({ testName, queryParams = '', customHeaders = {}, useExpiredTimestamp = false, useInvalidSignature = false, useInvalidApiKey = false }) {
  console.log(`\n========================================`);
  console.log(`[TEST]: ${testName}`);

  let timestamp;
  if (useExpiredTimestamp) {
    // Kurangi 10 menit agar di luar batas toleransi default 5 menit
    timestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  } else {
    timestamp = new Date().toISOString();
  }
  
  // Hitung Signature HMAC-SHA256
  // String payload: JSON.stringify(body) + timestamp. Untuk GET, body kosong {}
  const payload = JSON.stringify({}) + timestamp;
  let signature = crypto
    .createHmac('sha256', CLIENT_CONFIG.secret)
    .update(payload)
    .digest('hex');

  if (useInvalidSignature) {
    signature = 'invalid_signature_value_123456';
  }

  const apiKey = useInvalidApiKey ? 'invalid_api_key_xyz' : CLIENT_CONFIG.apiKey;

  const headers = {
    'x-device-code': CLIENT_CONFIG.deviceCode,
    'x-api-key': apiKey,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'x-site-code': CLIENT_CONFIG.siteCode,
    'x-dept-code': CLIENT_CONFIG.deptCode,
    ...customHeaders
  };

  const url = `${BASE_URL}${queryParams}`;
  console.log(`Request URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status Response: ${status}`);
    console.log(`Data Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Result: ERROR KONEKSI SERVER`, error.message);
  }
}

async function startTests() {
  console.log('Memulai Pengujian API Customer Search...');

  // Test 1: Sukses mencari customer berdasarkan nama
  await runSearchTest({
    testName: 'Cari berdasarkan nama (searchtext=budi)',
    queryParams: '?searchtext=budi'
  });

  // Test 2: Sukses mencari customer berdasarkan 4 digit terakhir ID
  await runSearchTest({
    testName: 'Cari berdasarkan 4 digit terakhir ID (searchtext=7802)',
    queryParams: '?searchtext=7802'
  });

  // Test 3: Sukses mencari customer tanpa searchtext
  await runSearchTest({
    testName: 'Cari tanpa parameter searchtext',
    queryParams: ''
  });

  // Test 4: Sukses mencari customer dengan paging offset
  await runSearchTest({
    testName: 'Cari dengan paging offset (searchtext=budi, offset=20)',
    queryParams: '?searchtext=budi&offset=20'
  });

  // Test 5: Error ketika API Key tidak valid
  await runSearchTest({
    testName: 'Security Check - API Key Tidak Valid',
    queryParams: '?searchtext=budi',
    useInvalidApiKey: true
  });

  // Test 6: Error ketika Signature tidak valid
  await runSearchTest({
    testName: 'Security Check - Signature Tidak Valid',
    queryParams: '?searchtext=budi',
    useInvalidSignature: true
  });

  // Test 7: Error ketika Timestamp kadaluarsa
  await runSearchTest({
    testName: 'Security Check - Timestamp Kadaluarsa',
    queryParams: '?searchtext=budi',
    useExpiredTimestamp: true
  });
}

startTests();
