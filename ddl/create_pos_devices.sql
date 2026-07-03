-- Table: pos_devices
-- Deskripsi: Menyimpan data kredensial perangkat POS (Machine-to-Machine)

CREATE TABLE IF NOT EXISTS pos_devices (
    device_id SERIAL PRIMARY KEY,
    device_code TEXT NOT NULL UNIQUE,
    device_num VARCHAR(2),
    api_key VARCHAR(255) NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    site_id INTEGER,
    site_code VARCHAR(50),
    site_name TEXT,
    struct_id INTEGER,
    struct_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (timezone('utc', now())) NOT NULL,
    datatimestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (timezone('utc', now())) NOT NULL,
    CONSTRAINT uq_device_num_site_id UNIQUE (device_num, site_id)
);

-- Index untuk mempercepat pencarian berdasarkan pasang device_id dan api_key
CREATE INDEX IF NOT EXISTS idx_pos_devices_auth 
ON pos_devices (device_id, api_key) 
WHERE is_active = TRUE;

-- Contoh trigger untuk memperbarui kolom datatimestamp secara otomatis (dalam UTC) saat ada update data
CREATE OR REPLACE FUNCTION update_datatimestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.datatimestamp = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pos_devices_datatimestamp
    BEFORE UPDATE ON pos_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_datatimestamp_column();

-- Sample Data
INSERT INTO pos_devices (device_id, device_code, device_num, api_key, secret, name, site_id, site_code, site_name, struct_id, struct_code, is_active)
VALUES 
    (1, 'pos-kasir-01', '21', 'key_kasir_satu_123', 'secret_kasir_satu_999_xyz', 'POS Kasir Utama', 10, 'SITE01', 'Bandung Indah Plaza', 20, 'DEPT01', true),
    (2, 'pos-kasir-02', '22', 'key_kasir_dua_456', 'secret_kasir_dua_888_abc', 'POS Kasir Cadangan', 10, 'SITE01', 'Bandung Indah Plaza', 20, 'DEPT01', true),
    (3, 'pos-kasir-03', '23', 'key_kasir_tiga_789', 'secret_kasir_tiga_777_def', 'POS Kasir Foodcourt', 11, 'SITE02', 'Paris Van Java', 21, 'DEPT02', false) -- Contoh perangkat non-aktif
ON CONFLICT (device_id) DO NOTHING;

