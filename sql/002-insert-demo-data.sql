--- 002-insert-demo-data.sql
INSERT INTO categories (name) VALUES ('Electronics');
INSERT INTO categories (name) VALUES ('Office Supplies');
INSERT INTO categories (name) VALUES ('Clothing');
INSERT INTO categories (name) VALUES ('School Supplies');

-- Generate 6 entries for each category. None of them should exist in real life.

-- Electronics
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Echo Comma', 'A smart speaker that listens to you while you sleep', 99.99, 1, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Water TV Stick', 'A streaming device that lets you watch TV', 39.99, 1, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Water Tablet', 'A tablet that lets you read books and watch movies', 49.99, 1, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Ding Dong Doorbell', 'A doorbell that lets you see who is at the door', 29.99, 1, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Fire TV Stick', 'A streaming device that lets you watch TV', 39.99, 1, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Kindle Paperwhite', 'A tablet that lets you read books and watch movies', 49.99, 1, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');

INSERT INTO inventory (product_id, quantity) VALUES (1, 50);
INSERT INTO inventory (product_id, quantity) VALUES (2, 50);
INSERT INTO inventory (product_id, quantity) VALUES (3, 50);
INSERT INTO inventory (product_id, quantity) VALUES (4, 50);
INSERT INTO inventory (product_id, quantity) VALUES (5, 50);
INSERT INTO inventory (product_id, quantity) VALUES (6, 50);

-- Office Supplies
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Surefire AA Batteries', 'A pack of 24 AA batteries', 9.99, 2, '/api/assets/surefire-aa-batteries.jpeg');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('AmazoniBasics 8-Sheet Cross-Cut Paper and Credit Card Home Office Shredder', 'Shreds paper and credit cards', 36.99, 2, '/api/assets/amazoni_paper.jpeg');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('AmazoniBasics 12-Sheet High-Security Micro-Cut Paper, CD, and Credit Card Shredder with Pullout Basket', 'Shreds paper, CDs, and credit cards', 99.99, 2, '/api/assets/amazoni_paper.jpeg');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Floortex Polycarbonate Chair Mat for Carpets to 1/2" Thick, 48" x 60"', 'A chair mat for carpets', 69.99, 2, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Calendars 2021', 'A pack of 3 calendars for 2021', 9.99, 2, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Pencils Pens Erasers', 'A pack of 24 pencils, 12 pens, and 6 erasers', 9.99, 2, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');

INSERT INTO inventory (product_id, quantity) VALUES (7, 100);
INSERT INTO inventory (product_id, quantity) VALUES (8, 100);
INSERT INTO inventory (product_id, quantity) VALUES (9, 100);
INSERT INTO inventory (product_id, quantity) VALUES (10, 100);
INSERT INTO inventory (product_id, quantity) VALUES (11, 100);
INSERT INTO inventory (product_id, quantity) VALUES (12, 100);

-- Clothing
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Foobar T-Shirt', 'A t-shirt with the word "Foobar" on it', 19.99, 3, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Barbaz Hoodie', 'A hoodie with the word "Barbaz" on it', 29.99, 3, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Bazqux Socks', 'A pack of 6 socks with the word "Bazqux" on them', 9.99, 3, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Quxquux Pants', 'A pair of pants with the word "Quxquux" on them', 39.99, 3, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Quuxcor Shoes', 'A pair of shoes with the word "Quuxcor" on them', 49.99, 3, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');
INSERT INTO products (name, description, price_per_unit, category_id, image_url) VALUES ('Corge Hat', 'A hat with the word "Corge" on it', 9.99, 3, '/api/assets/undraw_undraw_undraw_undraw_undraw_flying_drone_u3r2_-3-_egfy_-1-_2xjb_-1-_2hl5_(2)_ejqu.png');

INSERT INTO inventory (product_id, quantity) VALUES (13, 50);
INSERT INTO inventory (product_id, quantity) VALUES (14, 50);
INSERT INTO inventory (product_id, quantity) VALUES (15, 50);
INSERT INTO inventory (product_id, quantity) VALUES (16, 50);
INSERT INTO inventory (product_id, quantity) VALUES (17, 50);
INSERT INTO inventory (product_id, quantity) VALUES (18, 50);
