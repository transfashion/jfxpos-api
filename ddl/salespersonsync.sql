-- Table: salespersonsync (unlogged)
-- Deskripsi: Menyimpan data sinkronisasi salesperson per blok untuk sinkronisasi POS

CREATE UNLOGGED TABLE IF NOT EXISTS salespersonsync (
    possync_id BIGINT NOT NULL REFERENCES possync(possync_id) ON DELETE CASCADE,
    salesperson_id INTEGER NOT NULL REFERENCES salesperson(salesperson_id),
    datatimestamp TIMESTAMP NOT NULL,
    synnumber INTEGER NOT NULL,
    synblock INTEGER NOT NULL,
    PRIMARY KEY (possync_id, salesperson_id)
);

-- Index untuk mempercepat pencarian salesperson berdasarkan possync_id dan synblock
CREATE INDEX IF NOT EXISTS idx_salespersonsync_possync_synblock ON salespersonsync (possync_id, synblock);
