--- 000-init.sql
CREATE TABLE IF NOT EXISTS metadata
(
    key   TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO metadata (key, value)
VALUES ('db_version', '0') ON CONFLICT (key) DO NOTHING;
