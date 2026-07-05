-- Table: posdevice
-- Deskripsi: Menyimpan data kredensial perangkat POS (Machine-to-Machine)

CREATE TABLE IF NOT EXISTS posdevice (
    posdevice_id SERIAL PRIMARY KEY,
    posdevice_code TEXT NOT NULL UNIQUE,
    posdevice_num VARCHAR(2),
    api_key VARCHAR(255) NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    site_id INTEGER,
    site_code VARCHAR(50),
    site_name TEXT,
    struct_id INTEGER,
    struct_code VARCHAR(50),
    posdevice_isdisabled BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (timezone('utc', now())) NOT NULL,
    datatimestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (timezone('utc', now())) NOT NULL,
    CONSTRAINT uq_posdevice_num_site_id UNIQUE (posdevice_num, site_id)
);

-- Index untuk mempercepat pencarian berdasarkan pasang posdevice_id dan api_key
CREATE INDEX IF NOT EXISTS idx_pos_devices_auth 
ON posdevice (posdevice_id, api_key) 
WHERE posdevice_isdisabled = FALSE;

-- Contoh trigger untuk memperbarui kolom datatimestamp secara otomatis (dalam UTC) saat ada update data
CREATE OR REPLACE FUNCTION update_datatimestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.datatimestamp = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posdevice_datatimestamp
    BEFORE UPDATE ON posdevice
    FOR EACH ROW
    EXECUTE FUNCTION update_datatimestamp_column();

-- Sample Data
INSERT INTO posdevice (posdevice_id, posdevice_code, posdevice_num, api_key, secret, name, site_id, site_code, site_name, struct_id, struct_code, posdevice_isdisabled)
VALUES 
    (1, 'pos-kasir-01', '21', 'key_kasir_satu_123', 'secret_kasir_satu_999_xyz', 'POS Kasir Utama', 10, 'SITE01', 'Bandung Indah Plaza', 20, 'DEPT01', false),
    (2, 'pos-kasir-02', '22', 'key_kasir_dua_456', 'secret_kasir_dua_888_abc', 'POS Kasir Cadangan', 10, 'SITE01', 'Bandung Indah Plaza', 20, 'DEPT01', false),
    (3, 'pos-kasir-03', '23', 'key_kasir_tiga_789', 'secret_kasir_tiga_777_def', 'POS Kasir Foodcourt', 11, 'SITE02', 'Paris Van Java', 21, 'DEPT02', true) -- Contoh perangkat non-aktif (disabled = true)
ON CONFLICT (posdevice_id) DO NOTHING;


