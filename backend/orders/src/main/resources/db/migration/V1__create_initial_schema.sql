CREATE TABLE purchase_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    total_amount DOUBLE NOT NULL
);

INSERT INTO purchase_order (customer_name, total_amount) VALUES ('Diego Lazo', 85000.0);