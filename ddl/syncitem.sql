-- Table: syncitem (unlogged)
-- Deskripsi: Menyimpan data sinkronisasi item per blok untuk sinkronisasi POS

CREATE UNLOGGED TABLE IF NOT EXISTS syncitem (
    possync_id BIGINT NOT NULL REFERENCES possync(possync_id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL,
    datatimestamp TIMESTAMP NOT NULL,
    synnumber INTEGER NOT NULL,
    synblock INTEGER NOT NULL,
    PRIMARY KEY (possync_id, item_id)
);

-- Index untuk mempercepat pencarian item berdasarkan possync_id dan synblock
CREATE INDEX IF NOT EXISTS idx_syncitem_possync_synblock ON syncitem (possync_id, synblock);
