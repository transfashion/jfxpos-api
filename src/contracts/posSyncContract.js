/**
 * Database Contract untuk tabel POS Sync.
 * Menyimpan nama tabel dan kolom-kolom untuk menghindari hardcoding string.
 */
export const PosSyncContract = {
  TABLE_NAME: 'possync',
  Columns: {
    POSSYNC_ID: 'possync_id',
    POSDEVICE_ID: 'posdevice_id',
    SERVER_TIMESTAMP: 'server_timestamp',
    CLIENT_TIMESTAMP: 'client_timestamp',
    DATATIMESTAMP: 'datatimestamp',
    IS_COMPLETED: 'is_completed',
    IS_ERROR: 'is_error',
    ERRORMESSAGE: 'errormessage',
    POSSYNC_NAME: 'possync_name',
    POSSYNC_ROWCOUNT: 'possync_rowcount',
    POSSYNC_BLOCKCOUNT: 'possync_blockcount',
    POSSYNC_CLEANON: 'possync_cleanon'
  }
};
