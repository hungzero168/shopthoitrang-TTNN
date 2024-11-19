DROP DATABASE IF EXISTS shopthoitrang;
CREATE DATABASE IF NOT EXISTS shopthoitrang;

USE shopthoitrang;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE,
    title VARCHAR(255),
    price FLOAT,
    sale_price FLOAT,
    stock_quantity INT DEFAULT 0,
    featured_image VARCHAR(255),
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    gallery_image VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE
);

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE
);

CREATE TABLE product_categories (
    product_id INT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE product_tags (
    product_id INT,
    tag_id INT,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount FLOAT,
    shipping_address TEXT,
    shipping_phone VARCHAR(20),
    shipping_name VARCHAR(100),
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cod', 'bank_transfer', 'credit_card') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price FLOAT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- insert data
INSERT INTO users (email, password, full_name, role, status) VALUES ('admin@gmail.com', '123456', 'Admin', 'admin', 'active');

-- insert category
INSERT INTO categories (category_name) VALUES ('Áo khoác');
INSERT INTO categories (category_name) VALUES ('Áo thun');
INSERT INTO categories (category_name) VALUES ('Quần');
INSERT INTO categories (category_name) VALUES ('Váy đầm');

-- insert tag
INSERT INTO tags (tag_name) VALUES ('aokhoac'), ('aothun'), ('quan'), ('vaydam'), ('aosomi'), ('quanjean'), ('quanau'), ('quanshort'), ('aonam'), ('aothunnam'), ('aothunnu'), ('aonu');

-- insert product
INSERT INTO products (sku, title, price, sale_price, stock_quantity, featured_image, description, status) VALUES ('ao-khoac-chan-bong-co-mu', 'Áo Khoác Chần Bông | Có Mũ', 1400000, 0, 100, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470118/sub/goods_470118_sub14.jpg?width=750', 'Áo khoác mùa đông theo phong cách thời trang cao cấp', 'active');
INSERT INTO products (sku, title, price, sale_price, stock_quantity, featured_image, description, status) VALUES ('ao-thun-pickleball-yellow-print', 'Áo Thun Pickleball Yellow Print', 290000, 0, 50, 'https://product.hstatic.net/1000026602/product/img_1070_1e25ccf667b04ce8a666f9be3c412135_master.jpg', 'Áo thun cổ tròn theo phong cách thời trang cao cấp', 'active');
INSERT INTO products (sku, title, price, sale_price, stock_quantity, featured_image, description, status) VALUES ('ezy-jean-sieu-co-gian', 'EZY Quần Jeans Siêu Co Giãn', 980000, 55000, 30, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/455476/item/vngoods_06_455476.jpg?width=750', 'Quần jean theo phong cách thời trang cao cấp', 'active');
INSERT INTO products (sku, title, price, sale_price, stock_quantity, featured_image, description, status) VALUES ('dam-hoa-tiet-co-beo', 'Đầm họa tiết cổ bèo', 565000, 0, 20, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/2-nau-lde1011.jpg', 'Description 4', 'active');

-- insert product_categories
INSERT INTO product_categories (product_id, category_id) VALUES (1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (2, 2);
INSERT INTO product_categories (product_id, category_id) VALUES (3, 3);
INSERT INTO product_categories (product_id, category_id) VALUES (4, 4);

-- insert product_tags
INSERT INTO product_tags (product_id, tag_id) VALUES (1, 1);
INSERT INTO product_tags (product_id, tag_id) VALUES (2, 2);
INSERT INTO product_tags (product_id, tag_id) VALUES (3, 3);
INSERT INTO product_tags (product_id, tag_id) VALUES (4, 4);

-- insert product_gallery
INSERT INTO product_gallery (product_id, gallery_image) VALUES (1, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/sub/vngoods_470118_sub24.jpg?width=750');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (1, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/sub/vngoods_470118_sub25.jpg?width=750');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (1, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470118/sub/goods_470118_sub13.jpg?width=750');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (2, 'https://product.hstatic.net/1000026602/product/img_9083_ba0cfea5ff6a433dbea76438f3f45f6f_small.jpg');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (2, 'https://product.hstatic.net/1000026602/product/img_9085_bf3a137873e448f49b96912712a59fbb_master.jpg');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (2, 'https://product.hstatic.net/1000026602/product/img_9086_f9e9764d68724166b7b5f93408e126cb_master.jpg');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (3, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455476/sub/goods_455476_sub14.jpg?width=750');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (3, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455476/sub/goods_455476_sub15.jpg?width=750');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (4, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/4-nau-lde1011.jpg');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (4, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/7-nau-lde1011.jpg');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (4, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/8-nau-lde1011.jpg');

-- insert order
INSERT INTO orders (user_id, total_amount, shipping_address, shipping_phone, shipping_name, order_status, payment_method, payment_status) VALUES (1, 1400000, '123 Đường ABC, Quận XYZ, TP.HCM', '0123456789', 'Nguyễn Văn A', 'pending', 'cod', 'pending');

-- insert order_items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (1, 1, 1, 1400000);



-- add new product
INSERT INTO products (sku, title, price, stock_quantity, featured_image, status) VALUES ('ao-giu-nhiet-gia-long-cuu', 'HEATTECH Áo Giữ Nhiệt Giả Lông Cừu | Cổ Lọ', 391000, 50, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469953/item/vngoods_30_469953_3x4.jpg?width=369', 'active');
INSERT INTO product_categories (product_id, category_id) VALUES (5, 1);
INSERT INTO product_tags (product_id, tag_id) VALUES (5, 1);
INSERT INTO product_gallery (product_id, gallery_image) VALUES (5, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/442063/sub/goods_442063_sub14_3x4.jpg?width=369'),
(5, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/442063/sub/goods_442063_sub13_3x4.jpg?width=369');

INSERT INTO products (sku, title, price, stock_quantity, featured_image, status) VALUES ('ao-khoac-lot-long-gia-long-cuu-keo-khoa', 'Áo Khoác Lót Lông Giả Lông Cừu Kéo Khóa', 686000, 20, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469953/item/vngoods_30_469953_3x4.jpg?width=369', 'active');
INSERT INTO product_categories (product_id, category_id) VALUES (6, 1);
INSERT INTO product_tags (product_id, tag_id) VALUES (6, 1);
INSERT INTO product_gallery (product_id, gallery_image) VALUES (6, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469953/sub/vngoods_469953_sub7_3x4.jpg?width=369');

INSERT INTO products (sku, title, price, sale_price, stock_quantity, featured_image, status) VALUES ('ao-thun-vai-cotton-mem-dang-relax', 'Áo Thun Vải Cotton Mềm Dáng Relax | Kẻ Sọc', 391000, 283000, 20, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/472868/item/vngoods_01_472868_3x4.jpg?width=423', 'active');
INSERT INTO product_categories (product_id, category_id) VALUES (7, 2);
INSERT INTO product_tags (product_id, tag_id) VALUES (7, 2);
INSERT INTO product_gallery (product_id, gallery_image) VALUES (7, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/472868/sub/vngoods_472868_sub9_3x4.jpg?width=423');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (7, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/472868/sub/vngoods_472868_sub7_3x4.jpg?width=423');

INSERT INTO products (sku, title, price, stock_quantity, featured_image, status) VALUES ('airism-cotton-ao-thun', 'AIRism Cotton Áo Thun', 293000, 50, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465755/item/vngoods_33_465755_3x4.jpg?width=369', 'active');
INSERT INTO product_categories (product_id, category_id) VALUES (8, 2);
INSERT INTO product_tags (product_id, tag_id) VALUES (8, 2);
INSERT INTO product_gallery (product_id, gallery_image) VALUES (8, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465755/sub/goods_465755_sub13_3x4.jpg?width=369');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (8, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465755/sub/goods_465755_sub14_3x4.jpg?width=369');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (8, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465755/sub/goods_465755_sub17_3x4.jpg?width=369');

INSERT INTO products (sku, title, price, stock_quantity, featured_image, status) VALUES ('quan-ni-dry-dang-rong', 'Quần Nỉ Dry Dáng Rộng', 686000, 50, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/471642/item/vngoods_09_471642_3x4.jpg?width=369', 'active');
INSERT INTO product_categories (product_id, category_id) VALUES (9, 3);
INSERT INTO product_tags (product_id, tag_id) VALUES (9, 3);
INSERT INTO product_gallery (product_id, gallery_image) VALUES (9, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/471642/sub/goods_471642_sub12_3x4.jpg?width=369');
INSERT INTO product_gallery (product_id, gallery_image) VALUES (9, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/471642/sub/goods_471642_sub13_3x4.jpg?width=369');
