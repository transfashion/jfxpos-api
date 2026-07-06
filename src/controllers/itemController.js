import { PosSyncRepository } from '../repositories/posSyncRepository.js';

export const ItemController = {
  /**
   * API untuk mengambil persiapan sync item (prepareItemSyn).
   * Menyimpan data persiapan sync ke tabel possync.
   */
  async prepareItemSync(req, res) {
    const { posdevice_id, client_timestamp, datatimestamp } = req.body;

    // 1. Validasi keberadaan parameter wajib
    if (posdevice_id === undefined || !client_timestamp || datatimestamp === undefined || datatimestamp === null || datatimestamp === '') {
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
    let dataTime;
    if (datatimestamp === 0 || datatimestamp === '0') {
      dataTime = new Date(0);
    } else {
      dataTime = new Date(datatimestamp);
    }

    if (isNaN(clientTime.getTime()) || isNaN(dataTime.getTime())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Format client_timestamp atau datatimestamp tidak valid. Gunakan format ISO 8601 UTC.'
      });
    }

    try {
      // 4. Simpan ke database
      const possync_id = await PosSyncRepository.createItemSync({
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
  },

  /**
   * API untuk mengambil item berdasarkan blok halaman sinkronisasi (getItemSync).
   */
  async getItemSync(req, res) {
    const possync_id = parseInt(req.query.possync_id || req.body.possync_id, 10);
    const synblock = parseInt(req.query.synblock || req.body.synblock, 10);

    if (isNaN(possync_id) || isNaN(synblock)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Parameter possync_id dan synblock wajib diisi dengan angka.'
      });
    }

    try {
      // Validasi kepemilikan session sinkronisasi
      const syncSession = await PosSyncRepository.findById(possync_id);
      if (!syncSession) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sesi sinkronisasi tidak ditemukan.'
        });
      }

      // Pastikan posdevice_id pada session cocok dengan posdevice_id yang terautentikasi
      if (syncSession.posdevice_id !== req.device.posdevice_id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Anda tidak memiliki akses ke sesi sinkronisasi ini.'
        });
      }

      const items = await PosSyncRepository.getItemsByBlock(possync_id, synblock);

      return res.json({
        success: true,
        possync_id,
        synblock,
        count: items.length,
        data: items
      });
    } catch (error) {
      console.error('Error in getItemSync controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal mengambil data sinkronisasi item.'
      });
    }
  },

  /**
   * API untuk menyelesaikan proses sinkronisasi item dan memperbarui statusnya (finishItemSync).
   */
  async finishItemSync(req, res) {
    const { possync_id, is_completed, is_error, errormessage } = req.body;

    if (possync_id === undefined || is_completed === undefined || is_error === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Parameter possync_id, is_completed, dan is_error wajib diisi.'
      });
    }

    const parsedSyncId = parseInt(possync_id, 10);
    if (isNaN(parsedSyncId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'possync_id harus berupa angka.'
      });
    }

    try {
      // Validasi kepemilikan session
      const syncSession = await PosSyncRepository.findById(parsedSyncId);
      if (!syncSession) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sesi sinkronisasi tidak ditemukan.'
        });
      }

      if (syncSession.posdevice_id !== req.device.posdevice_id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Anda tidak memiliki akses ke sesi sinkronisasi ini.'
        });
      }

      // Update data di database
      await PosSyncRepository.updateSyncStatus(parsedSyncId, {
        is_completed: !!is_completed,
        is_error: !!is_error,
        errormessage: errormessage || null
      });

      return res.json({
        success: true,
        message: 'Status sinkronisasi berhasil diperbarui.'
      });
    } catch (error) {
      console.error('Error in finishItemSync controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal memperbarui status sinkronisasi.'
      });
    }
  }
};
