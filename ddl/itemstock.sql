-- Table: itemstock
CREATE TABLE IF NOT EXISTS itemstock (
    stockdate DATE NOT NULL,
    item_id BIGINT NOT NULL,
    qty INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT pk_itemstock PRIMARY KEY (stockdate, item_id),
    CONSTRAINT fk_itemstock_item_id FOREIGN KEY (item_id) REFERENCES item (item_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_itemstock_item_id ON itemstock (item_id);
