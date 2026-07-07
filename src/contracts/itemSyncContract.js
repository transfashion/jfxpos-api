/**
 * Database Contract untuk tabel Item Sync.
 * Menyimpan nama tabel dan kolom-kolom untuk menghindari hardcoding string.
 */
export const ItemSyncContract = {
  TABLE_NAME: 'itemsync',
  Columns: {
    POSSYNC_ID: 'possync_id',
    ITEM_ID: 'item_id',
    DATATIMESTAMP: 'datatimestamp',
    SYNNUMBER: 'synnumber',
    SYNBLOCK: 'synblock'
  }
};
