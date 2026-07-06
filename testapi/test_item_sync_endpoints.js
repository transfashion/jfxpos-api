/**
 * Test Script untuk menguji API endpoint:
 * - GET /api/items/getItemSync
 * - POST /api/items/finishItemSync
 *
 * Cara menjalankan:
 * 1. Pastikan server Express aktif (`npm run dev` atau `node src/app.js`)
 * 2. Jalankan script ini: `node testapi/test_item_sync_endpoints.js`
 */

import crypto from 'crypto';

const PREPARE_URL = 'http://localhost:3000/api/items/prepareItemSyn';
const GET_SYNC_URL = 'http://localhost:3000/api/items/getItemSync';
const FINISH_SYNC_URL = 'http://localhost:3000/api/items/finishItemSync';

const CLIENT_CONFIG = {
  deviceCode: 'pos-kasir-01',
  apiKey: 'key_kasir_satu_123',
  secret: 'secret_kasir_satu_999_xyz',
  siteCode: 'SITE01',
  deptCode: 'DEPT01'
};

function getHeaders(body, url) {
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify(body || {}) + timestamp;
  const signature = crypto
    .createHmac('sha256', CLIENT_CONFIG.secret)
    .update(payload)
    .digest('hex');

  return {
    'x-device-code': CLIENT_CONFIG.deviceCode,
    'x-api-key': CLIENT_CONFIG.apiKey,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'x-site-code': CLIENT_CONFIG.siteCode,
    'x-dept-code': CLIENT_CONFIG.deptCode,
    'Content-Type': 'application/json'
  };
}

async function runTests() {
  console.log('Memulai Pengujian API Item Sync...');

  let possync_id = null;

  // Step 1: Prepare item sync to get a session ID
  try {
    const prepareBody = {
      posdevice_id: 1,
      client_timestamp: new Date().toISOString(),
      datatimestamp: 0 // Fetch all items
    };
    const response = await fetch(PREPARE_URL, {
      method: 'POST',
      headers: getHeaders(prepareBody),
      body: JSON.stringify(prepareBody)
    });

    const data = await response.json();
    console.log('\n[STEP 1] Prepare Item Sync Response Status:', response.status);
    console.log('Prepare Item Sync Data:', JSON.stringify(data, null, 2));

    if (response.status === 201 && data.success) {
      possync_id = data.data.possync_id;
    } else {
      console.error('Gagal menyiapkan sinkronisasi item. Tes dihentikan.');
      return;
    }
  } catch (err) {
    console.error('Koneksi gagal saat prepareItemSyn:', err.message);
    return;
  }

  // Step 2: Get items for block 1
  try {
    const queryParams = `?possync_id=${possync_id}&synblock=1`;
    const response = await fetch(`${GET_SYNC_URL}${queryParams}`, {
      method: 'GET',
      headers: getHeaders(null) // GET request body is empty object for signature
    });

    const text = await response.text();
    console.log('\n[STEP 2] Get Item Sync (Block 1) Response Status:', response.status);
    try {
      const data = JSON.parse(text);
      console.log('Get Item Sync Data (first 2 items):', JSON.stringify({
        success: data.success,
        possync_id: data.possync_id,
        synblock: data.synblock,
        count: data.count,
        data: data.data ? data.data.slice(0, 2) : []
      }, null, 2));
    } catch (e) {
      console.log('Raw Get Response:', text);
    }
  } catch (err) {
    console.error('Koneksi gagal saat getItemSync:', err.message);
  }

  // Step 3: Finish sync session
  try {
    const finishBody = {
      possync_id: possync_id,
      is_completed: true,
      is_error: false,
      errormessage: ''
    };
    const response = await fetch(FINISH_SYNC_URL, {
      method: 'POST',
      headers: getHeaders(finishBody),
      body: JSON.stringify(finishBody)
    });

    const text = await response.text();
    console.log('\n[STEP 3] Finish Item Sync Response Status:', response.status);
    try {
      const data = JSON.parse(text);
      console.log('Finish Item Sync Data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Raw Finish Response:', text);
    }
  } catch (err) {
    console.error('Koneksi gagal saat finishItemSync:', err.message);
  }
}

runTests();
