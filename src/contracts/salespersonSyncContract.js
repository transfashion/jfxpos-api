/**
 * Database Contract untuk tabel Salesperson Sync.
 * Menyimpan nama tabel dan kolom-kolom untuk menghindari hardcoding string.
 */
export const SalespersonSyncContract = {
  TABLE_NAME: 'syncsalesperson',
  Columns: {
    POSSYNC_ID: 'possync_id',
    SALESPERSON_ID: 'salesperson_id',
    DATATIMESTAMP: 'datatimestamp',
    SYNNUMBER: 'synnumber',
    SYNBLOCK: 'synblock'
  }
};
