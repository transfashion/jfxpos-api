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
    (1, 'Regular'),
    (2, 'VIP Platinum'),
    (3, 'VIP Gold'),
    (4, 'Employee / Internal')
ON CONFLICT (customertype_id) DO NOTHING;

-- Seed Data: customer (50 rows)
INSERT INTO customer (customer_id, customer_name, customer_disc, customer_disc_datestart, customer_disc_dateend, customertype_id, customer_gender, customer_birthdate, customer_isdisabled)
VALUES
    (1001, 'Ahmad Fauzi', 0.00, NULL, NULL, 1, 1, '1990-05-14', false),
    (1002, 'Budi Santoso', 0.10, '2026-01-01', '2026-12-31', 3, 1, '1985-08-22', false),
    (1003, 'Citra Lestari', 0.15, '2026-06-01', '2026-12-31', 2, 2, '1993-11-02', false),
    (1004, 'Dewi Sartika', 0.00, NULL, NULL, 1, 2, '1988-02-28', false),
    (1005, 'Eko Prasetyo', 0.05, '2026-01-01', '2026-06-30', 4, 1, '1995-07-19', false),
    (1006, 'Fitri Handayani', 0.00, NULL, NULL, 1, 2, '1992-09-05', false),
    (1007, 'Guntur Wibowo', 0.10, '2026-03-01', '2026-09-30', 3, 1, '1982-12-12', false),
    (1008, 'Hendra Wijaya', 0.15, '2026-01-01', '2026-12-31', 2, 1, '1979-04-30', false),
    (1009, 'Indah Permatasari', 0.00, NULL, NULL, 1, 2, '1994-06-15', false),
    (1010, 'Joko Susilo', 0.05, '2026-01-01', '2026-12-31', 4, 1, '1987-10-10', true), -- Disabled
    (1011, 'Kartika Sari', 0.10, '2026-05-01', '2026-11-30', 3, 2, '1991-03-25', false),
    (1012, 'Lukman Hakim', 0.00, NULL, NULL, 1, 1, '1989-01-17', false),
    (1013, 'Maria Ulfah', 0.15, '2026-01-01', '2026-12-31', 2, 2, '1986-07-08', false),
    (1014, 'Novianti', 0.00, NULL, NULL, 1, 2, '1996-12-03', false),
    (1015, 'Oki Setiawan', 0.05, '2026-02-01', '2026-08-31', 4, 1, '1990-08-14', false),
    (1016, 'Putri Ayu', 0.00, NULL, NULL, 1, 2, '1993-05-20', false),
    (1017, 'Qori Sandi', 0.10, '2026-01-01', '2026-12-31', 3, 1, '1984-10-02', false),
    (1018, 'Rian Hidayat', 0.15, '2026-04-01', '2026-10-31', 2, 1, '1988-11-15', false),
    (1019, 'Siti Aminah', 0.00, NULL, NULL, 1, 2, '1991-09-09', false),
    (1020, 'Taufik Rahman', 0.05, '2026-01-01', '2026-12-31', 4, 1, '1992-02-14', false),
    (1021, 'Utami Ningsih', 0.00, NULL, NULL, 1, 2, '1987-03-12', false),
    (1022, 'Vicky Prasetya', 0.10, '2026-01-01', '2026-06-30', 3, 1, '1994-07-28', false),
    (1023, 'Wahyudi', 0.15, '2026-01-01', '2026-12-31', 2, 1, '1980-09-18', false),
    (1024, 'Xena Olivia', 0.00, NULL, NULL, 1, 2, '1997-10-24', false),
    (1025, 'Yayan Ruhiyan', 0.05, '2026-01-01', '2026-12-31', 4, 1, '1975-11-20', false),
    (1026, 'Zulkifli', 0.00, NULL, NULL, 1, 1, '1983-04-05', false),
    (1027, 'Aditya Nugraha', 0.10, '2026-01-01', '2026-12-31', 3, 1, '1992-08-30', false),
    (1028, 'Bella Cantika', 0.15, '2026-02-15', '2026-08-15', 2, 2, '1995-03-14', false),
    (1029, 'Candra Wijaya', 0.00, NULL, NULL, 1, 1, '1986-06-25', false),
    (1030, 'Dina Mariana', 0.05, '2026-01-01', '2026-12-31', 4, 2, '1981-01-09', false),
    (1031, 'Fajar Ramadhan', 0.00, NULL, NULL, 1, 1, '1993-09-12', false),
    (1032, 'Gita Gutawa', 0.10, '2026-01-01', '2026-12-31', 3, 2, '1990-08-11', false),
    (1033, 'Hadi Mulya', 0.15, '2026-03-01', '2026-09-30', 2, 1, '1978-05-16', false),
    (1034, 'Irma Suryani', 0.00, NULL, NULL, 1, 2, '1989-10-22', false),
    (1035, 'Jefri Nichol', 0.05, '2026-01-01', '2026-12-31', 4, 1, '1999-01-15', false),
    (1036, 'Kiki Amalia', 0.00, NULL, NULL, 1, 2, '1984-11-26', false),
    (1037, 'Lulu Tobing', 0.10, '2026-01-01', '2026-12-31', 3, 2, '1977-11-21', false),
    (1038, 'Mamat Alkatiri', 0.15, '2026-01-01', '2026-12-31', 2, 1, '1992-06-24', false),
    (1039, 'Nina Zatulini', 0.00, NULL, NULL, 1, 2, '1991-11-22', false),
    (1040, 'Onadio Leonardo', 0.05, '2026-05-01', '2026-12-31', 4, 1, '1990-01-04', false),
    (1041, 'Prisia Nasution', 0.00, NULL, NULL, 1, 2, '1984-06-01', false),
    (1042, 'Raditya Dika', 0.10, '2026-01-01', '2026-12-31', 3, 1, '1984-12-28', false),
    (1043, 'Sherina Munaf', 0.15, '2026-01-01', '2026-12-31', 2, 2, '1990-06-01', false),
    (1044, 'Tora Sudiro', 0.00, NULL, NULL, 1, 1, '1973-05-10', false),
    (1045, 'Uus Wijaksana', 0.05, '2026-01-01', '2026-12-31', 4, 1, '1990-12-23', false),
    (1046, 'Vanesha Prescilla', 0.00, NULL, NULL, 1, 2, '1999-10-25', false),
    (1047, 'Wulan Guritno', 0.10, '2026-01-01', '2026-12-31', 3, 2, '1981-04-14', false),
    (1048, 'Yura Yunita', 0.15, '2026-01-01', '2026-12-31', 2, 2, '1991-06-09', false),
    (1049, 'Ziva Magnolya', 0.00, NULL, NULL, 1, 2, '2001-03-14', false),
    (1050, 'Ariel Noah', 0.05, '2026-01-01', '2026-12-31', 4, 1, '1981-09-16', false)
ON CONFLICT (customer_id) DO NOTHING;
