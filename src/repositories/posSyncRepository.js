import { db } from '../config/db.js';
import { PosSyncContract } from '../contracts/posSyncContract.js';

export const PosSyncRepository = {
  /**
   * Menemukan data possync berdasarkan ID.
   * @param {number} possync_id
   * @returns {Promise<Object|null>}
   */
  async findById(possync_id) {
    return db.oneOrNone(`
      SELECT * FROM ${PosSyncContract.TABLE_NAME}
      WHERE ${PosSyncContract.Columns.POSSYNC_ID} = $1
    `, [possync_id]);
  },

  /**
   * Memperbarui status akhir dari sinkronisasi.
   * @param {number} possync_id
   * @param {Object} status
   * @param {boolean} status.is_completed
   * @param {boolean} status.is_error
   * @param {string|null} status.errormessage
   */
  async updateSyncStatus(possync_id, { is_completed, is_error, errormessage }) {
    const query = `
      UPDATE ${PosSyncContract.TABLE_NAME}
      SET 
        ${PosSyncContract.Columns.IS_COMPLETED} = $1,
        ${PosSyncContract.Columns.IS_ERROR} = $2,
        ${PosSyncContract.Columns.ERRORMESSAGE} = $3,
        ${PosSyncContract.Columns.SERVER_TIMESTAMP} = CURRENT_TIMESTAMP
      WHERE ${PosSyncContract.Columns.POSSYNC_ID} = $4
    `;
    await db.none(query, [is_completed, is_error, errormessage, possync_id]);
  }
};
