import { db } from '../config/db.js';
import { CustomerContract, CustomerTypeContract } from '../contracts/customerContract.js';

export const CustomerRepository = {
  /**
   * Mendapatkan data Customer berdasarkan ID, di-join dengan nama tipe customer.
   * @param {number|string} customerId
   * @returns {Promise<Object|null>} data customer lengkap dengan customertype_name.
   */
  async findById(customerId) {
    const query = `
      SELECT 
        c.*, 
        ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_NAME}
      FROM ${CustomerContract.TABLE_NAME} c
      LEFT JOIN ${CustomerTypeContract.TABLE_NAME} ct 
        ON c.${CustomerContract.Columns.CUSTOMERTYPE_ID} = ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_ID}
      WHERE c.${CustomerContract.Columns.CUSTOMER_ID} = $1
    `;

    try {
      const customer = await db.oneOrNone(query, [customerId]);
      return customer;
    } catch (error) {
      console.error('Error saat mencari Customer berdasarkan ID:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan daftar semua customer, di-join dengan nama tipe customer.
   * @returns {Promise<Array>} list customer.
   */
  async findAll() {
    const query = `
      SELECT 
        c.*, 
        ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_NAME}
      FROM ${CustomerContract.TABLE_NAME} c
      LEFT JOIN ${CustomerTypeContract.TABLE_NAME} ct 
        ON c.${CustomerContract.Columns.CUSTOMERTYPE_ID} = ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_ID}
      ORDER BY c.${CustomerContract.Columns.CUSTOMER_ID} ASC
    `;

    try {
      const customers = await db.any(query);
      return customers;
    } catch (error) {
      console.error('Error saat mengambil daftar semua Customer:', error);
      throw error;
    }
  }
};
