export const PosDeviceController = {
  /**
   * Mendapatkan data POS Device (Kredensial sudah tervalidasi oleh middleware authenticateApiKey).
   * Melakukan pencocokan tambahan pada siteCode dan deptCode.
   */
  async getDevice(req, res) {
    try {
      const device = req.device;
      const siteCode = req.siteCode;
      const deptCode = req.deptCode; // DeptCode dikirimkan klien pada header X-Dept-Code

      // Cocokkan siteCode dan deptCode dengan record di database
      if (device.site_code !== siteCode || device.struct_code !== deptCode) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Kombinasi Site Code atau Struct Code tidak cocok dengan data perangkat.'
        });
      }

      // Jika cocok, kembalikan 1 baris data device
      return res.json({
        success: true,
        data: device
      });

    } catch (error) {
      console.error('Error in getDevice controller:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Gagal memproses data POS Device.'
      });
    }
  }
};
