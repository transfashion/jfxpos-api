import { db } from '../config/db.js';
import { PosSyncContract } from '../contracts/posSyncContract.js';
import { ItemSyncContract } from '../contracts/itemSyncContract.js';

const SYNC_RETENTION_DAYS = 30;
const SYNC_BLOCK_SIZE = 50;

export const ItemSyncRepository = {
  /**
   * Membuat record baru untuk persiapan sinkronisasi dan menyalin data item ke itemsync dalam transaksi yang sama.
   */
  async createItemSync({ posdevice_id, client_timestamp, datatimestamp }) {
    // Hapus data sync lama secara async (fire-and-forget) sebelum transaksi
    db.none(`
      DELETE FROM ${PosSyncContract.TABLE_NAME}
      WHERE ${PosSyncContract.Columns.POSSYNC_CLEANON} < CURRENT_DATE
    `).catch(err => {
      console.error('Error deleting expired possync data:', err);
    });

    return db.tx(async t => {
      const cleanOnDate = new Date();
      cleanOnDate.setDate(cleanOnDate.getDate() + SYNC_RETENTION_DAYS);

      // 1. Insert data ke possync
      const insertSyncQuery = `
        INSERT INTO ${PosSyncContract.TABLE_NAME} (
          ${PosSyncContract.Columns.POSDEVICE_ID},
          ${PosSyncContract.Columns.CLIENT_TIMESTAMP},
          ${PosSyncContract.Columns.DATATIMESTAMP},
          ${PosSyncContract.Columns.IS_COMPLETED},
          ${PosSyncContract.Columns.IS_ERROR},
          ${PosSyncContract.Columns.POSSYNC_NAME},
          ${PosSyncContract.Columns.POSSYNC_CLEANON}
        )
        VALUES ($1, $2, $3, false, false, $4, $5)
        RETURNING ${PosSyncContract.Columns.POSSYNC_ID}
      `;

      const record = await t.one(insertSyncQuery, [
        parseInt(posdevice_id, 10),
        client_timestamp,
        datatimestamp,
        'ITEM SYNC',
        cleanOnDate
      ]);

      const possyncId = record.possync_id;

      // 2. Copy semua data item ke itemsync dengan item.datatimestamp >= datatimestamp
      const copyItemsQuery = `
        INSERT INTO ${ItemSyncContract.TABLE_NAME} (
          ${ItemSyncContract.Columns.POSSYNC_ID},
          ${ItemSyncContract.Columns.ITEM_ID},
          ${ItemSyncContract.Columns.DATATIMESTAMP},
          ${ItemSyncContract.Columns.SYNNUMBER},
          ${ItemSyncContract.Columns.SYNBLOCK}
        )
        SELECT 
          $1::BIGINT,
          item_id,
          datatimestamp,
          row_num,
          ((row_num - 1) / $3) + 1
        FROM (
          SELECT 
            item_id, 
            datatimestamp,
            ROW_NUMBER() OVER (ORDER BY datatimestamp ASC, item_id ASC) AS row_num
          FROM item
          WHERE datatimestamp >= $2
        ) subquery
      `;

      const result = await t.result(copyItemsQuery, [possyncId, datatimestamp, SYNC_BLOCK_SIZE]);
      const rowCount = result.rowCount;
      const blockCount = rowCount > 0 ? Math.ceil(rowCount / SYNC_BLOCK_SIZE) : 0;

      // 3. Update possync dengan rowcount dan blockcount
      const updateSyncQuery = `
        UPDATE ${PosSyncContract.TABLE_NAME}
        SET 
          ${PosSyncContract.Columns.POSSYNC_ROWCOUNT} = $1,
          ${PosSyncContract.Columns.POSSYNC_BLOCKCOUNT} = $2
        WHERE ${PosSyncContract.Columns.POSSYNC_ID} = $3
      `;

      await t.none(updateSyncQuery, [rowCount, blockCount, possyncId]);

      return {
        possync_id: possyncId,
        rowcount: rowCount,
        blockcount: blockCount
      };
    });
  },

  /**
   * Mengambil item pada halaman (block) tertentu untuk sesi sinkronisasi possync_id.
   */
  async getItemsByBlock(possync_id, synblock) {
    return db.any(`
      SELECT 
        i.*,
        its.${ItemSyncContract.Columns.SYNNUMBER},
        its.${ItemSyncContract.Columns.SYNBLOCK},
        (
          SELECT COALESCE(json_agg(ib ORDER BY ib.itembarcode_id), '[]'::json)
          FROM itembarcode ib
          WHERE ib.item_id = i.item_id
        ) as barcodes
      FROM ${ItemSyncContract.TABLE_NAME} its
      INNER JOIN item i ON its.${ItemSyncContract.Columns.ITEM_ID} = i.item_id
      WHERE its.${ItemSyncContract.Columns.POSSYNC_ID} = $1 
        AND its.${ItemSyncContract.Columns.SYNBLOCK} = $2
      ORDER BY its.${ItemSyncContract.Columns.SYNNUMBER} ASC
    `, [possync_id, synblock]);
  }
};
