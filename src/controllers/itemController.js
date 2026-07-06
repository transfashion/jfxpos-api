import { PosSyncRepository } from '../repositories/posSyncRepository.js';

export const ItemController = {
  /**
   * API untuk mengambil persiapan sync item (prepareItemSyn).
   * Menyimpan data persiapan sync ke tabel possync.
   */
  async prepareItemSync(req, res) {
    const { posdevice_id, client_timestamp, datatimestamp } = req.body;

    // 1. Validasi keberadaan parameter wajib
    if (posdevice_id === undefined || !client_timestamp || !datatimestamp) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Parameter posdevice_id, client_timestamp, dan datatimestamp wajib diisi.'
      });
    }

    // 2. Cocokkan posdevice_id dengan perangkat yang terautentikasi
    if (parseInt(posdevice_id, 10) !== req.device.posdevice_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'posdevice_id tidak cocok dengan identitas perangkat yang terautentikasi.'
      });
    }

    // 3. Validasi format timestamp
    const clientTime = new Date(client_timestamp);
    const dataTime = new Date(datatimestamp);

    if (isNaN(clientTime.getTime()) || isNaN(dataTime.getTime())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Format client_timestamp atau datatimestamp tidak valid. Gunakan format ISO 8601 UTC.'
      });
    }

    try {
      // 4. Simpan ke database
      const possync_id = await PosSyncRepository.create({
        posdevice_id,
        client_timestamp: clientTime,
        datatimestamp: dataTime
      });

      return res.status(201).json({
        success: true,
        message: 'Persiapan sinkronisasi berhasil disimpan.',
        data: {
          possync_id
        }
      });
    } catch (error) {
      console.error('Error in prepareItemSync controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal memproses persiapan sinkronisasi item.'
      });
    }
  }
};
