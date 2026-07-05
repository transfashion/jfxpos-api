import crypto from 'crypto';
import dotenv from 'dotenv';
import { PosDeviceRepository } from '../repositories/posDeviceRepository.js';

dotenv.config();

/**
 * Middleware untuk memvalidasi integritas data (Request Signing) & kredensial M2M.
 * Klien wajib melampirkan header:
 * - X-Device-Code
 * - X-API-Key
 * - X-Timestamp (format ISO 8601 UTC)
 * - X-Signature (HMAC-SHA256 dari string body + timestamp menggunakan secret perangkat)
 */
export const authenticateApiKey = async (req, res, next) => {
  const deviceCode = req.headers['x-device-code'];
  const apiKey = req.headers['x-api-key'];
  const timestamp = req.headers['x-timestamp'];
  const clientSignature = req.headers['x-signature'];
  const siteCode = req.headers['x-site-code'];
  const deptCode = req.headers['x-dept-code'];

  // 1. Validasi keberadaan header wajib
  if (!deviceCode || !apiKey || !timestamp || !clientSignature || !siteCode || !deptCode) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Header autentikasi dan integritas tidak lengkap. Wajib melampirkan X-Device-Code, X-API-Key, X-Timestamp, X-Signature, X-Site-Code, dan X-Dept-Code.'
    });
  }

  // 2. Validasi toleransi waktu (timestamp) untuk mencegah Replay Attacks
  const requestTime = new Date(timestamp);
  const currentTime = new Date();

  if (isNaN(requestTime.getTime())) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Format X-Timestamp tidak valid. Gunakan format ISO 8601 UTC.'
    });
  }

  const toleranceMinutes = parseInt(process.env.TIMESTAMP_TOLERANCE_MINUTES || '5', 10);
  const diffMinutes = Math.abs(currentTime - requestTime) / 60000;

  if (diffMinutes > toleranceMinutes) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: `Toleransi waktu terlampaui. Selisih waktu request (${diffMinutes.toFixed(2)} menit) melampaui batas toleransi (${toleranceMinutes} menit).`
    });
  }

  try {
    // 3. Cari perangkat di database untuk mendapatkan Secret
    const device = await PosDeviceRepository.findByDeviceCodeAndApiKey(deviceCode, apiKey);

    if (!device) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Kredensial POS Device tidak terdaftar atau dinonaktifkan.'
      });
    }

    // 4. Rekonstruksi signature di server menggunakan Secret perangkat
    // Payload pembentuk signature adalah stringified body + timestamp
    const payload = JSON.stringify(req.body || {}) + timestamp;
    const computedSignature = crypto
      .createHmac('sha256', device.secret)
      .update(payload)
      .digest('hex');

    // 5. Bandingkan signature secara aman (Constant-time comparison)
    const computedBuffer = Buffer.from(computedSignature, 'hex');
    const clientBuffer = Buffer.from(clientSignature, 'hex');

    if (computedBuffer.length !== clientBuffer.length) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Tanda tangan keamanan (Signature) tidak valid. Integritas data tidak terverifikasi.'
      });
    }

    const isSignatureValid = crypto.timingSafeEqual(computedBuffer, clientBuffer);

    if (!isSignatureValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Tanda tangan keamanan (Signature) tidak valid. Integritas data tidak terverifikasi.'
      });
    }

    // Pasang data device ke req agar dapat diakses oleh handler/controller selanjutnya
    req.device = device;
    req.siteCode = siteCode;
    req.deptCode = deptCode;
    next();
  } catch (error) {
    console.error('Autentikasi Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Gagal memproses verifikasi keamanan request.'
    });
  }
};
