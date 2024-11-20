--- 002-insert-demo-data.sql

INSERT INTO products (name, description, price_per_unit) VALUES ('Echo Comma', 'A smart speaker that listens to you while you sleep', 99.99);
INSERT INTO products (name, description, price_per_unit) VALUES ('Water TV Stick', 'A streaming device that lets you watch TV', 39.99);
INSERT INTO products (name, description, price_per_unit) VALUES ('Soonfire AA Batteries', 'A pack of 24 AA batteries', 9.99);
INSERT INTO products (name, description, price_per_unit) VALUES ('AmazoniBasics 8-Sheet Cross-Cut Paper and Credit Card Home Office Shredder', 'Shreds paper and credit cards', 36.99);

INSERT INTO inventory (product_id, quantity) VALUES (1, 50);
INSERT INTO inventory (product_id, quantity) VALUES (2, 50);
INSERT INTO inventory (product_id, quantity) VALUES (3, 100);
INSERT INTO inventory (product_id, quantity) VALUES (4, 100);
