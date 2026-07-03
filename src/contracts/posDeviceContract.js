/**
 * Database Contract untuk tabel POS Devices.
 * Menyimpan nama tabel dan kolom-kolom untuk menghindari hardcoding string.
 */
export const PosDeviceContract = {
  TABLE_NAME: 'pos_devices',
  Columns: {
    DEVICE_ID: 'device_id',
    DEVICE_CODE: 'device_code',
    DEVICE_NUM: 'device_num',
    API_KEY: 'api_key',
    SECRET: 'secret',
    NAME: 'name',
    SITE_ID: 'site_id',
    SITE_CODE: 'site_code',
    SITE_NAME: 'site_name',
    STRUCT_ID: 'struct_id',
    STRUCT_CODE: 'struct_code',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    DATATIMESTAMP: 'datatimestamp'
  }
};
