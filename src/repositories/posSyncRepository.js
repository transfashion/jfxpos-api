import { db } from '../config/db.js';
import { PosSyncContract } from '../contracts/posSyncContract.js';

export const PosSyncRepository = {
  /**
   * Membuat record baru untuk persiapan sinkronisasi.
   * @param {Object} data
   * @param {number} data.posdevice_id
   * @param {string|Date} data.client_timestamp
   * @param {string|Date} data.datatimestamp
   * @returns {Promise<Object>} data record yang berhasil dibuat.
   */
  async create({ posdevice_id, client_timestamp, datatimestamp }) {
    const query = `
      INSERT INTO ${PosSyncContract.TABLE_NAME} (
        ${PosSyncContract.Columns.POSDEVICE_ID},
        ${PosSyncContract.Columns.CLIENT_TIMESTAMP},
        ${PosSyncContract.Columns.DATATIMESTAMP},
        ${PosSyncContract.Columns.IS_COMPLETED},
        ${PosSyncContract.Columns.IS_ERROR}
      )
      VALUES ($1, $2, $3, false, false)
      RETURNING ${PosSyncContract.Columns.POSSYNC_ID}
    `;

    try {
      const record = await db.one(query, [
        parseInt(posdevice_id, 10),
        client_timestamp,
        datatimestamp
      ]);
      return record.possync_id;
    } catch (error) {
      console.error('Error saat menyimpan data possync ke database:', error);
      throw error;
    }
  }
};
