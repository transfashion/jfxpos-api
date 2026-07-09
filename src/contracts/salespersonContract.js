/**
 * Database Contract untuk tabel Salesperson.
 * Menyimpan nama tabel dan kolom-kolom untuk menghindari hardcoding string.
 */
export const SalespersonContract = {
  TABLE_NAME: 'salesperson',
  Columns: {
    SALESPERSON_ID: 'salesperson_id',
    SALESPERSON_NIK: 'salesperson_nik',
    SALESPERSON_NAME: 'salesperson_name',
    SALESPERSON_ISDISABLED: 'salesperson_isdisabled',
    BRAND_ID: 'brand_id',
    SITE_ID: 'site_id',
    DATATIMESTAMP: 'datatimestamp',
    MD5HASH: 'md5hash'
  }
};
