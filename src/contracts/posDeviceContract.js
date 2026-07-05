/**
 * Database Contract untuk tabel POS Devices.
 * Menyimpan nama tabel dan kolom-kolom untuk menghindari hardcoding string.
 */
export const PosDeviceContract = {
  TABLE_NAME: 'posdevice',
  Columns: {
    POSDEVICE_ID: 'posdevice_id',
    POSDEVICE_CODE: 'posdevice_code',
    POSDEVICE_NUM: 'posdevice_num',
    API_KEY: 'api_key',
    SECRET: 'secret',
    NAME: 'name',
    SITE_ID: 'site_id',
    SITE_CODE: 'site_code',
    SITE_NAME: 'site_name',
    STRUCT_ID: 'struct_id',
    STRUCT_CODE: 'struct_code',
    POSDEVICE_ISDISABLED: 'posdevice_isdisabled',
    CREATED_AT: 'created_at',
    DATATIMESTAMP: 'datatimestamp'
  }
};
