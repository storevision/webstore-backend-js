--- 001-create-tables.sql

-- users

CREATE TABLE users
(
    id                  SERIAL PRIMARY KEY,
    email               TEXT      NOT NULL UNIQUE,
    display_name        TEXT      NOT NULL,
    password_hash       TEXT      NOT NULL,
    password_changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- profile_picture_data_url TEXT
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


-- categories
CREATE TABLE categories
(
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);


-- products
CREATE TABLE products
(
    id                   SERIAL PRIMARY KEY,
    name                 TEXT           NOT NULL,
    description          TEXT           NOT NULL,
    image_url            TEXT           NOT NULL,
    -- image width and height will be set by the server
    image_width          INTEGER,
    image_height         INTEGER,
    blurred_image        TEXT,
    blurred_image_width  INTEGER,
    blurred_image_height INTEGER,
    price_per_unit       DECIMAL(10, 2) NOT NULL,
    category_id          INTEGER        NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- helps queries that filter by category_id
CREATE INDEX ON products (category_id);

CREATE TABLE inventory
(
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- helps queries that filter by product_id
CREATE INDEX ON inventory (product_id);

CREATE TABLE reviews
(
    id         SERIAL PRIMARY KEY,
    product_id INTEGER   NOT NULL,
    user_id    INTEGER   NOT NULL,
    rating     INTEGER   NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comment    TEXT,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE MATERIALIZED VIEW product_ratings AS
SELECT product_id,
       COUNT(*) FILTER (WHERE rating = 1) AS one_star,
       COUNT(*) FILTER (WHERE rating = 2) AS two_stars,
       COUNT(*) FILTER (WHERE rating = 3) AS three_stars,
       COUNT(*) FILTER (WHERE rating = 4) AS four_stars,
       COUNT(*) FILTER (WHERE rating = 5) AS five_stars,
       COUNT(*)                           AS total_reviews,
       ROUND(AVG(rating), 2)              AS average_rating
FROM reviews
GROUP BY product_id;

CREATE FUNCTION refresh_product_ratings()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
BEGIN
    REFRESH MATERIALIZED VIEW product_ratings;
    RETURN NULL;
END;
$$;

CREATE TRIGGER refresh_product_ratings
    AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
    ON reviews
    FOR EACH STATEMENT
EXECUTE FUNCTION refresh_product_ratings();

-- helps queries that filter by product_id
CREATE INDEX ON reviews (product_id);

-- helps queries that filter by user_id
CREATE INDEX ON reviews (user_id);

-- carts

CREATE TABLE cart_items
(
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- orders

CREATE TABLE orders
(
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER   NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE order_items
(
    order_id       INTEGER        NOT NULL,
    product_id     INTEGER        NOT NULL,
    quantity       INTEGER        NOT NULL,
    -- price_per_unit is stored to prevent price changes from affecting past orders
    price_per_unit DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);
