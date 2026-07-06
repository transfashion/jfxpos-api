-- Table: possync
-- Deskripsi: Menyimpan data persiapan dan status sinkronisasi item per perangkat POS

CREATE TABLE IF NOT EXISTS possync (
    possync_id BIGSERIAL PRIMARY KEY,
    posdevice_id INTEGER NOT NULL REFERENCES posdevice(posdevice_id),
    server_timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    datatimestamp TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    is_error BOOLEAN DEFAULT FALSE NOT NULL,
    errormessage TEXT,
    possync_name TEXT,
    possync_rowcount INTEGER,
    possync_blockcount INTEGER,
    possync_cleanon DATE
);

-- Index untuk mempercepat pencarian data sync berdasarkan posdevice
CREATE INDEX IF NOT EXISTS idx_possync_posdevice ON possync (posdevice_id);
CREATE INDEX IF NOT EXISTS idx_possync_cleanon ON possync (possync_cleanon);

