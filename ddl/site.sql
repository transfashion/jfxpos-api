CREATE TABLE site (
    site_id INT PRIMARY KEY,
    site_name TEXT NOT NULL UNIQUE,
    site_isdisabled BOOLEAN NOT NULL DEFAULT FALSE,
    site_code TEXT NOT NULL UNIQUE
);



sitepaymdev_id

