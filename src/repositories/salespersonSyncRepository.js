import { db } from '../config/db.js';
import { PosSyncContract } from '../contracts/posSyncContract.js';
import { SalespersonContract } from '../contracts/salespersonContract.js';
import { SalespersonSyncContract } from '../contracts/salespersonSyncContract.js';

const SYNC_RETENTION_DAYS = 30;
const SYNC_BLOCK_SIZE = 50;

export const SalespersonSyncRepository = {
  /**
   * Membuat record baru untuk persiapan sinkronisasi dan menyalin data salesperson ke salespersonsync dalam transaksi yang sama.
   */
  async createSalespersonSync({ posdevice_id, client_timestamp, datatimestamp, site_id }) {
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
        'SALESPERSON SYNC',
        cleanOnDate
      ]);

      const possyncId = record.possync_id;

      // 2. Copy semua data salesperson ke salespersonsync dengan salesperson.datatimestamp >= datatimestamp dan site_id = site_id
      const copySalespersonsQuery = `
        INSERT INTO ${SalespersonSyncContract.TABLE_NAME} (
          ${SalespersonSyncContract.Columns.POSSYNC_ID},
          ${SalespersonSyncContract.Columns.SALESPERSON_ID},
          ${SalespersonSyncContract.Columns.DATATIMESTAMP},
          ${SalespersonSyncContract.Columns.SYNNUMBER},
          ${SalespersonSyncContract.Columns.SYNBLOCK}
        )
        SELECT 
          $1::BIGINT,
          salesperson_id,
          datatimestamp,
          row_num,
          ((row_num - 1) / $3) + 1
        FROM (
          SELECT 
            salesperson_id, 
            datatimestamp,
            ROW_NUMBER() OVER (ORDER BY datatimestamp ASC, salesperson_id ASC) AS row_num
          FROM salesperson
          WHERE datatimestamp >= $2 AND site_id = $4
        ) subquery
      `;

      const result = await t.result(copySalespersonsQuery, [possyncId, datatimestamp, SYNC_BLOCK_SIZE, parseInt(site_id, 0)]);
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
   * Mengambil salesperson pada halaman (block) tertentu untuk sesi sinkronisasi possync_id.
   */
  async getSalespersonsByBlock(possync_id, synblock) {
    return db.any(`
      SELECT 
        s.*,
        ss.${SalespersonSyncContract.Columns.SYNNUMBER},
        ss.${SalespersonSyncContract.Columns.SYNBLOCK}
      FROM ${SalespersonSyncContract.TABLE_NAME} ss
      INNER JOIN salesperson s ON ss.${SalespersonSyncContract.Columns.SALESPERSON_ID} = s.salesperson_id
      WHERE ss.${SalespersonSyncContract.Columns.POSSYNC_ID} = $1 
        AND ss.${SalespersonSyncContract.Columns.SYNBLOCK} = $2
      ORDER BY ss.${SalespersonSyncContract.Columns.SYNNUMBER} ASC
    `, [possync_id, synblock]);
  }
};
