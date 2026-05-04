CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL,
    stock INT NOT NULL
);

INSERT INTO product (name, price, stock) VALUES ('Silla Ergonómica', 85000.0, 20);