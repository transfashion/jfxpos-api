import { CustomerRepository } from '../repositories/customerRepository.js';

export const CustomerController = {
  /**
   * Mendapatkan detail Customer berdasarkan customerId.
   */
  async getCustomerById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Parameter ID customer tidak boleh kosong.'
      });
    }

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Format ID customer tidak valid. ID harus berupa angka.'
      });
    }

    try {
      const customer = await CustomerRepository.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Customer dengan ID '${id}' tidak ditemukan.`
        });
      }

      return res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error in getCustomerById controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal mengambil data customer.'
      });
    }
  },

  /**
   * Mendapatkan daftar Customer dengan paging (mencegah beban memori berlebih).
   */
  async getAllCustomers(req, res) {
    const { offset = 0 } = req.query;

    const parsedLimit = 20; // Dikunci tetap 20 baris
    const parsedOffset = parseInt(offset, 10) || 0;

    try {
      const customers = await CustomerRepository.findAll(parsedLimit, parsedOffset);
      return res.json({
        success: true,
        limit: parsedLimit,
        offset: parsedOffset,
        count: customers.length,
        data: customers
      });
    } catch (error) {
      console.error('Error in getAllCustomers controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal mengambil daftar customer.'
      });
    }
  },

  /**
   * Mencari customer dengan paging berdasarkan query parameters: limit, offset, searchtext.
   */
  async searchCustomers(req, res) {
    const { offset = 0, searchtext } = req.query;

    const parsedLimit = 20; // Dikunci tetap 20 baris
    const parsedOffset = parseInt(offset, 10) || 0;

    try {
      const customers = await CustomerRepository.search(searchtext, parsedLimit, parsedOffset);
      return res.json({
        success: true,
        limit: parsedLimit,
        offset: parsedOffset,
        count: customers.length,
        data: customers
      });
    } catch (error) {
      console.error('Error in searchCustomers controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal mencari data customer.'
      });
    }
  }
};
