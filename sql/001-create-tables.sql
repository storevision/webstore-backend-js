--- 001-create-tables.sql

CREATE TABLE categories
(
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE products
(
    id             SERIAL PRIMARY KEY,
    name           TEXT           NOT NULL,
    description    TEXT           NOT NULL,
    image_url      TEXT           NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    category_id    INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE inventory
(
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
