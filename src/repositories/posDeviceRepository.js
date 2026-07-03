import { db } from '../config/db.js';
import { PosDeviceContract } from '../contracts/posDeviceContract.js';

export const PosDeviceRepository = {
  /**
   * Mencari POS Device berdasarkan Device Code dan API Key.
   * @param {string} deviceCode
   * @param {string} apiKey
   * @returns {Promise<Object|null>} data POS Device jika ditemukan, atau null.
   */
  async findByDeviceCodeAndApiKey(deviceCode, apiKey) {
    const query = `
      SELECT * FROM ${PosDeviceContract.TABLE_NAME}
      WHERE ${PosDeviceContract.Columns.DEVICE_CODE} = $1
        AND ${PosDeviceContract.Columns.API_KEY} = $2
        AND ${PosDeviceContract.Columns.IS_ACTIVE} = true
      LIMIT 1
    `;

    try {
      const device = await db.oneOrNone(query, [deviceCode, apiKey]);
      return device;
    } catch (error) {
      console.error('Error saat mencari POS Device berdasarkan Code & API Key:', error);
      throw error;
    }
  },

  /**
   * Mencari POS Device berdasarkan Device Code.
   * @param {string} deviceCode
   * @returns {Promise<Object|null>} data POS Device jika ditemukan, atau null.
   */
  async findByDeviceCode(deviceCode) {
    const query = `
      SELECT * FROM ${PosDeviceContract.TABLE_NAME}
      WHERE ${PosDeviceContract.Columns.DEVICE_CODE} = $1
      LIMIT 1
    `;

    try {
      const device = await db.oneOrNone(query, [deviceCode]);
      return device;
    } catch (error) {
      console.error('Error saat mencari POS Device berdasarkan Device Code:', error);
      throw error;
    }
  }
};
