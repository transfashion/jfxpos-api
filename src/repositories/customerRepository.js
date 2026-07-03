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
   * Mendapatkan daftar customer dengan batasan paging, di-join dengan nama tipe customer.
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<Array>} list customer.
   */
  async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT 
        c.*, 
        ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_NAME}
      FROM ${CustomerContract.TABLE_NAME} c
      LEFT JOIN ${CustomerTypeContract.TABLE_NAME} ct 
        ON c.${CustomerContract.Columns.CUSTOMERTYPE_ID} = ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_ID}
      ORDER BY c.${CustomerContract.Columns.CUSTOMER_ID} ASC
      LIMIT $1 OFFSET $2
    `;

    try {
      const customers = await db.any(query, [parseInt(limit, 10), parseInt(offset, 10)]);
      return customers;
    } catch (error) {
      console.error('Error saat mengambil daftar Customer:', error);
      throw error;
    }
  },

  /**
   * Melakukan pencarian customer dengan paging berdasarkan nama (like) atau 4 digit terakhir ID.
   * @param {string} searchText
   * @param {number} limit
   * @param {number} offset
   */
  async search(searchText, limit = 10, offset = 0) {
    let query = `
      SELECT 
        c.*, 
        ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_NAME}
      FROM ${CustomerContract.TABLE_NAME} c
      LEFT JOIN ${CustomerTypeContract.TABLE_NAME} ct 
        ON c.${CustomerContract.Columns.CUSTOMERTYPE_ID} = ct.${CustomerTypeContract.Columns.CUSTOMERTYPE_ID}
    `;

    const params = [];
    const conditions = [];

    if (searchText) {
      // Parameter 1: pencarian nama menggunakan %searchText%
      params.push(`%${searchText}%`);
      // Parameter 2: pencarian 4 digit terakhir ID menggunakan %searchText
      params.push(`%${searchText}`);
      
      conditions.push(`(
        c.${CustomerContract.Columns.CUSTOMER_NAME} ILIKE $1 
        OR CAST(c.${CustomerContract.Columns.CUSTOMER_ID} AS TEXT) LIKE $2
      )`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY c.${CustomerContract.Columns.CUSTOMER_ID} ASC`;
    
    // Pagination
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    query += ` LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    
    params.push(parseInt(limit, 10));
    params.push(parseInt(offset, 10));

    try {
      const customers = await db.any(query, params);
      return customers;
    } catch (error) {
      console.error('Error saat mencari Customer dengan paging:', error);
      throw error;
    }
  }
};
