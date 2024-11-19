-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 29, 2024 lúc 09:04 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `shopthoitrang`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp(),
  `modified_date` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `product_id`, `quantity`, `created_date`, `modified_date`) VALUES
(24, 2, 1, 1, '2024-10-29 14:38:15', NULL),
(25, 2, 4, 3, '2024-10-29 14:39:01', '2024-10-29 14:43:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `category_name`) VALUES
(1, 'Áo khoác'),
(2, 'Áo thun'),
(3, 'Quần'),
(4, 'Váy đầm');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` float DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `shipping_name` varchar(100) DEFAULT NULL,
  `order_status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method` enum('cod','bank_transfer','credit_card') DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `created_date` datetime DEFAULT current_timestamp(),
  `modified_date` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_address`, `shipping_phone`, `shipping_name`, `order_status`, `payment_method`, `payment_status`, `created_date`, `modified_date`) VALUES
(1, 1, 1400000, '123 Đường ABC, Quận XYZ, TP.HCM', '0123456789', 'Nguyễn Văn A', 'delivered', 'cod', 'pending', '2024-10-28 16:20:19', '2024-10-29 10:03:04'),
(2, 1, 290000, 'TNg', '0377966897', 'admin', 'shipped', 'cod', 'pending', '2024-10-29 09:15:53', '2024-10-29 10:03:09'),
(3, 1, 2310000, 'TNguy', '0377966897', 'admin', 'cancelled', 'cod', 'pending', '2024-10-29 09:18:54', '2024-10-29 10:03:14'),
(4, 1, 1400000, 'TNg', '0377966897', 'admin', 'pending', 'cod', 'pending', '2024-10-29 09:20:11', NULL),
(5, 1, 290000, 'TNg', '0377966897', 'admin', 'pending', 'cod', 'pending', '2024-10-29 09:22:10', NULL),
(6, 1, 0, 'TNg', '0377966897', 'admin', 'pending', 'bank_transfer', 'pending', '2024-10-29 09:24:59', NULL),
(7, 1, 1455000, 'TNguyen', '0377966897', 'admin', 'pending', 'bank_transfer', 'pending', '2024-10-29 09:26:12', NULL),
(8, 2, 4810000, 'TNG', '123456789', 'user1', 'processing', 'cod', 'pending', '2024-10-29 10:28:17', '2024-10-29 11:35:14'),
(9, 2, 4060000, 'TNG', '123456789', 'user1', 'pending', 'cod', 'pending', '2024-10-29 11:33:50', NULL),
(10, 2, 2825000, 'TNG', '123456789', 'user1', 'cancelled', 'credit_card', 'pending', '2024-10-29 11:38:06', '2024-10-29 11:38:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 1400000),
(2, 2, 2, 1, 290000),
(3, 3, 1, 1, 1400000),
(4, 3, 2, 1, 290000),
(5, 3, 3, 1, 55000),
(6, 3, 4, 1, 565000),
(7, 4, 1, 1, 1400000),
(8, 5, 2, 1, 290000),
(9, 7, 1, 1, 1400000),
(10, 7, 3, 1, 55000),
(11, 8, 2, 1, 290000),
(12, 8, 4, 8, 565000),
(13, 9, 1, 1, 1400000),
(14, 9, 2, 1, 290000),
(15, 9, 3, 2, 55000),
(16, 9, 4, 4, 565000),
(17, 10, 4, 5, 565000);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `sale_price` float DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `featured_image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_date` datetime DEFAULT current_timestamp(),
  `modified_date` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `sku`, `title`, `price`, `sale_price`, `stock_quantity`, `featured_image`, `description`, `status`, `created_date`, `modified_date`) VALUES
(1, 'ao-khoac-chan-bong-co-mu', 'Áo Khoác Chần Bông | Có Mũ', 1400000, 0, 100, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470118/sub/goods_470118_sub14.jpg?width=750', 'Áo khoác mùa đông theo phong cách thời trang cao cấp', 'active', '2024-10-01 10:08:22', '2024-10-29 09:48:15'),
(2, 'ao-thun-pickleball-yellow-print', 'Áo Thun Pickleball Yellow Print', 290000, 0, 50, 'https://product.hstatic.net/1000026602/product/img_1070_1e25ccf667b04ce8a666f9be3c412135_master.jpg', 'Áo thun cổ tròn theo phong cách thời trang cao cấp', 'active', '2024-10-28 10:08:22', NULL),
(3, 'ezy-jean-sieu-co-gian', 'EZY Quần Jeans Siêu Co Giãn', 980000, 550000, 30, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/455476/item/vngoods_06_455476.jpg?width=750', 'Quần jean theo phong cách thời trang cao cấp', 'active', '2024-10-28 10:08:22', '2024-10-29 11:36:59'),
(4, 'dam-hoa-tiet-co-beo', 'Đầm họa tiết cổ bèo', 565000, 0, 3, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/2-nau-lde1011.jpg', 'Description 4', 'active', '2024-10-28 10:08:22', '2024-10-29 10:11:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_categories`
--

CREATE TABLE `product_categories` (
  `product_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_categories`
--

INSERT INTO `product_categories` (`product_id`, `category_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_gallery`
--

CREATE TABLE `product_gallery` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `gallery_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_gallery`
--

INSERT INTO `product_gallery` (`id`, `product_id`, `gallery_image`) VALUES
(1, 1, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/sub/vngoods_470118_sub24.jpg?width=750'),
(2, 1, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/sub/vngoods_470118_sub25.jpg?width=750'),
(3, 1, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470118/sub/goods_470118_sub13.jpg?width=750'),
(4, 2, 'https://product.hstatic.net/1000026602/product/img_9083_ba0cfea5ff6a433dbea76438f3f45f6f_small.jpg'),
(5, 2, 'https://product.hstatic.net/1000026602/product/img_9085_bf3a137873e448f49b96912712a59fbb_master.jpg'),
(6, 2, 'https://product.hstatic.net/1000026602/product/img_9086_f9e9764d68724166b7b5f93408e126cb_master.jpg'),
(7, 3, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455476/sub/goods_455476_sub14.jpg?width=750'),
(8, 3, 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455476/sub/goods_455476_sub15.jpg?width=750'),
(9, 4, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/4-nau-lde1011.jpg'),
(10, 4, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/7-nau-lde1011.jpg'),
(11, 4, 'https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/lde1011/8-nau-lde1011.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_tags`
--

CREATE TABLE `product_tags` (
  `product_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_tags`
--

INSERT INTO `product_tags` (`product_id`, `tag_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `tag_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tags`
--

INSERT INTO `tags` (`id`, `tag_name`) VALUES
(1, 'aokhoac'),
(9, 'aonam'),
(12, 'aonu'),
(5, 'aosomi'),
(2, 'aothun'),
(10, 'aothunnam'),
(11, 'aothunnu'),
(3, 'quan'),
(7, 'quanau'),
(6, 'quanjean'),
(8, 'quanshort'),
(4, 'vaydam');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_date` datetime DEFAULT current_timestamp(),
  `modified_date` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `address`, `role`, `status`, `created_date`, `modified_date`) VALUES
(1, 'admin@gmail.com', '123456', 'admin', '0377966897', 'TNguyen', 'admin', 'active', '2024-10-28 10:08:21', '2024-10-29 09:26:12'),
(2, 'user@gmail.com', '123456', 'user1', '123456789', 'TNG', 'customer', 'active', '2024-10-29 09:28:57', '2024-10-29 09:29:59');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`);

--
-- Chỉ mục cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`product_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `product_gallery`
--
ALTER TABLE `product_gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`product_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Chỉ mục cho bảng `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag_name` (`tag_name`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `product_gallery`
--
ALTER TABLE `product_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_gallery`
--
ALTER TABLE `product_gallery`
  ADD CONSTRAINT `product_gallery_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_tags`
--
ALTER TABLE `product_tags`
  ADD CONSTRAINT `product_tags_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
