-- Table: customertype
CREATE TABLE IF NOT EXISTS customertype (
    customertype_id SMALLINT PRIMARY KEY,
    customertype_name TEXT NOT NULL
);

-- Table: customer
CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGINT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_disc DECIMAL(2,2) DEFAULT 0.00 NOT NULL,
    customer_disc_datestart DATE,
    customer_disc_dateend DATE,
    customertype_id SMALLINT REFERENCES customertype(customertype_id),
    customer_gender SMALLINT, -- Contoh: 1 = Laki-laki, 2 = Perempuan
    customer_birthdate DATE,
    customer_isdisabled BOOLEAN DEFAULT FALSE NOT NULL,
    datatimestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (timezone('utc', now())) NOT NULL
);

-- Index untuk pencarian cepat berdasarkan 4 digit terakhir customer_id
CREATE INDEX IF NOT EXISTS idx_customer_id_last4 ON customer (right(customer_id::text, 4));

-- Index untuk mempercepat sinkronisasi / pencarian berdasarkan waktu data diubah
CREATE INDEX IF NOT EXISTS idx_customer_datatimestamp ON customer (datatimestamp);

-- Contoh trigger untuk memperbarui kolom datatimestamp secara otomatis (dalam UTC) saat ada update data customer
CREATE OR REPLACE FUNCTION update_customer_datatimestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.datatimestamp = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_timestamp
    BEFORE UPDATE ON customer
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_datatimestamp();

-- Seed Data: customertype
INSERT INTO customertype (customertype_id, customertype_name)
VALUES 
    (0, 'Reguler'),
    (1, 'VIP')
ON CONFLICT (customertype_id) DO NOTHING;

-- Seed Data: customer (50 rows)
INSERT INTO customer (customer_id, customer_name, customer_disc, customer_disc_datestart, customer_disc_dateend, customertype_id, customer_gender, customer_birthdate, customer_isdisabled)
VALUES
    (81234567801, 'AHMAD FAUZI', 0.00, NULL, NULL, 0, 1, '1990-05-14', false),
    (81234567802, 'BUDI SANTOSO', 0.10, '2026-01-01', '2026-12-31', 1, 1, '1985-08-22', false),
    (81234567803, 'CITRA LESTARI', 0.15, '2026-06-01', '2026-12-31', 1, 2, '1993-11-02', false),
    (81234567804, 'DEWI SARTIKA', 0.00, NULL, NULL, 0, 2, '1988-02-28', false),
    (81234567805, 'EKO PRASETYO', 0.05, '2026-01-01', '2026-06-30', 0, 1, '1995-07-19', false),
    (81234567806, 'FITRI HANDAYANI', 0.00, NULL, NULL, 0, 2, '1992-09-05', false),
    (81234567807, 'GUNTUR WIBOWO', 0.10, '2026-03-01', '2026-09-30', 1, 1, '1982-12-12', false),
    (81234567808, 'HENDRA WIJAYA', 0.15, '2026-01-01', '2026-12-31', 1, 1, '1979-04-30', false),
    (81234567809, 'INDAH PERMATASARI', 0.00, NULL, NULL, 0, 2, '1994-06-15', false),
    (81234567810, 'JOKO SUSILO', 0.05, '2026-01-01', '2026-12-31', 0, 1, '1987-10-10', true), -- Disabled
    (81234567811, 'KARTIKA SARI', 0.10, '2026-05-01', '2026-11-30', 1, 2, '1991-03-25', false),
    (81234567812, 'LUKMAN HAKIM', 0.00, NULL, NULL, 0, 1, '1989-01-17', false),
    (81234567813, 'MARIA ULFAH', 0.15, '2026-01-01', '2026-12-31', 1, 2, '1986-07-08', false),
    (81234567814, 'NOVIANTI', 0.00, NULL, NULL, 0, 2, '1996-12-03', false),
    (81234567815, 'OKI SETIAWAN', 0.05, '2026-02-01', '2026-08-31', 0, 1, '1990-08-14', false),
    (81234567816, 'PUTRI AYU', 0.00, NULL, NULL, 0, 2, '1993-05-20', false),
    (81234567817, 'QORI SANDI', 0.10, '2026-01-01', '2026-12-31', 1, 1, '1984-10-02', false),
    (81234567818, 'RIAN HIDAYAT', 0.15, '2026-04-01', '2026-10-31', 1, 1, '1988-11-15', false),
    (81234567819, 'SITI AMINAH', 0.00, NULL, NULL, 0, 2, '1991-09-09', false),
    (81234567820, 'TAUFIK RAHMAN', 0.05, '2026-01-01', '2026-12-31', 0, 1, '1992-02-14', false),
    (81234567821, 'UTAMI NINGSIH', 0.00, NULL, NULL, 0, 2, '1987-03-12', false),
    (81234567822, 'VICKY PRASETYA', 0.10, '2026-01-01', '2026-06-30', 1, 1, '1994-07-28', false),
    (81234567823, 'WAHYUDI', 0.15, '2026-01-01', '2026-12-31', 1, 1, '1980-09-18', false),
    (81234567824, 'XENA OLIVIA', 0.00, NULL, NULL, 0, 2, '1997-10-24', false),
    (81234567825, 'YAYAN RUHIYAN', 0.05, '2026-01-01', '2026-12-31', 0, 1, '1975-11-20', false),
    (81234567826, 'ZULKIFLI', 0.00, NULL, NULL, 0, 1, '1983-04-05', false),
    (81234567827, 'ADITYA NUGRAHA', 0.10, '2026-01-01', '2026-12-31', 1, 1, '1992-08-30', false),
    (81234567828, 'BELLA CANTIKA', 0.15, '2026-02-15', '2026-08-15', 1, 2, '1995-03-14', false),
    (81234567829, 'CANDRA WIJAYA', 0.00, NULL, NULL, 0, 1, '1986-06-25', false),
    (81234567830, 'DINA MARIANA', 0.05, '2026-01-01', '2026-12-31', 0, 2, '1981-01-09', false),
    (81234567831, 'FAJAR RAMADHAN', 0.00, NULL, NULL, 0, 1, '1993-09-12', false),
    (81234567832, 'GITA GUTAWA', 0.10, '2026-01-01', '2026-12-31', 1, 2, '1990-08-11', false),
    (81234567833, 'HADI MULYA', 0.15, '2026-03-01', '2026-09-30', 1, 1, '1978-05-16', false),
    (81234567834, 'IRMA SURYANI', 0.00, NULL, NULL, 0, 2, '1989-10-22', false),
    (81234567835, 'JEFRI NICHOL', 0.05, '2026-01-01', '2026-12-31', 0, 1, '1999-01-15', false),
    (81234567836, 'KIKI AMALIA', 0.00, NULL, NULL, 0, 2, '1984-11-26', false),
    (81234567837, 'LULU TOBING', 0.10, '2026-01-01', '2026-12-31', 1, 2, '1977-11-21', false),
    (81234567838, 'MAMAT ALKATIRI', 0.15, '2026-01-01', '2026-12-31', 1, 1, '1992-06-24', false),
    (81234567839, 'NINA ZATULINI', 0.00, NULL, NULL, 0, 2, '1991-11-22', false),
    (81234567840, 'ONADIO LEONARDO', 0.05, '2026-05-01', '2026-12-31', 0, 1, '1990-01-04', false),
    (81234567841, 'PRISIA NASUTION', 0.00, NULL, NULL, 0, 2, '1984-06-01', false),
    (81234567842, 'RADITYA DIKA', 0.10, '2026-01-01', '2026-12-31', 1, 1, '1984-12-28', false),
    (81234567843, 'SHERINA MUNAF', 0.15, '2026-01-01', '2026-12-31', 1, 2, '1990-06-01', false),
    (81234567844, 'TORA SUDIRO', 0.00, NULL, NULL, 0, 1, '1973-05-10', false),
    (81234567845, 'UUS WIJAKSANA', 0.05, '2026-01-01', '2026-12-31', 0, 1, '1990-12-23', false),
    (81234567846, 'VANESHA PRESCILLA', 0.00, NULL, NULL, 0, 2, '1999-10-25', false),
    (81234567847, 'WULAN GURITNO', 0.10, '2026-01-01', '2026-12-31', 1, 2, '1981-04-14', false),
    (81234567848, 'YURA YUNITA', 0.15, '2026-01-01', '2026-12-31', 1, 2, '1991-06-09', false),
    (81234567849, 'ZIVA MAGNOLYA', 0.00, NULL, NULL, 0, 2, '2001-03-14', false),
    (81234567850, 'ARIEL NOAH', 0.05, '2026-01-01', '2026-12-31', 0, 1, '1981-09-16', false)
ON CONFLICT (customer_id) DO NOTHING;
