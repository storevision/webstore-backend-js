--- 001-create-tables.sql

CREATE TABLE categories
(
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE products
(
    id                   SERIAL PRIMARY KEY,
    name                 TEXT           NOT NULL,
    description          TEXT           NOT NULL,
    image_url            TEXT           NOT NULL,
    blurred_image        TEXT,
    blurred_image_width  INTEGER,
    blurred_image_height INTEGER,
    price_per_unit       DECIMAL(10, 2) NOT NULL,
    category_id          INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE inventory
(
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE users
(
    id                  SERIAL PRIMARY KEY,
    email               TEXT      NOT NULL UNIQUE,
    display_name        TEXT      NOT NULL,
    password_hash       TEXT      NOT NULL,
    password_changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE FUNCTION set_password_changed_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
BEGIN
    NEW.password_changed_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_password_changed_at
    BEFORE UPDATE OF password_hash
    ON users
    FOR EACH ROW
EXECUTE FUNCTION set_password_changed_at();
