<?php
include 'connect.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_POST['product_name']) || empty($_POST['sku']) || !isset($_POST['product_price'])) {
        echo json_encode(['status' => 'error', 'message' => 'Product name, SKU, and price are required.']);
        exit;
    }

    mysqli_begin_transaction($conn);

    try {
        $product_name = mysqli_real_escape_string($conn, $_POST['product_name']);
        $sku = mysqli_real_escape_string($conn, $_POST['sku']);
        $product_price = floatval($_POST['product_price']);
        
        $check_sku_sql = "SELECT id FROM products WHERE sku = ?";
        $check_sku_stmt = mysqli_prepare($conn, $check_sku_sql);
        mysqli_stmt_bind_param($check_sku_stmt, "s", $sku);
        mysqli_stmt_execute($check_sku_stmt);
        mysqli_stmt_store_result($check_sku_stmt);
        
        if (mysqli_stmt_num_rows($check_sku_stmt) > 0) {
            mysqli_rollback($conn);
            echo json_encode(['status' => 'error', 'message' => 'SKU already exists.']);
            exit;
        }
        
        $sql = "INSERT INTO products (sku, title, price) VALUES (?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssd", $sku, $product_name, $product_price);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to insert product: ' . mysqli_error($conn));
        }

        $product_id = mysqli_insert_id($conn);

        if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../img/uploads/';
            if (!is_dir($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    throw new Exception('Failed to create upload directory.');
                }
            }

            $featured_image = $_FILES['featured_image'];
            $featured_image_name = uniqid() . '_' . basename($featured_image['name']);
            $featured_image_path = $upload_dir . $featured_image_name;

            if (!move_uploaded_file($featured_image['tmp_name'], $featured_image_path)) {
                throw new Exception('Failed to upload featured image.');
            }

            $featured_image_path_db = 'img/uploads/' . $featured_image_name;
            $sql_update = "UPDATE products SET featured_image = ? WHERE id = ?";
            $stmt_update = mysqli_prepare($conn, $sql_update);
            mysqli_stmt_bind_param($stmt_update, "si", $featured_image_path_db, $product_id);
            if (!mysqli_stmt_execute($stmt_update)) {
                throw new Exception('Failed to update product with featured image: ' . mysqli_error($conn));
            }
        }

        if (isset($_POST['gallery_images']) && !empty($_POST['gallery_images'])) {
            $gallery_images = json_decode($_POST['gallery_images']);
            $upload_dir = '../img/uploads/';
            if (!is_dir($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    throw new Exception('Failed to create upload directory.');
                }
            }

            $sql_gallery = "INSERT INTO product_gallery (product_id, gallery_image) VALUES (?, ?)";
            $stmt_gallery = mysqli_prepare($conn, $sql_gallery);

            foreach ($gallery_images as $gallery_image) {
                $image_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $gallery_image));
                $gallery_image_name = uniqid() . '.png';
                $gallery_image_path = $upload_dir . $gallery_image_name;

                if (file_put_contents($gallery_image_path, $image_data) === false) {
                    throw new Exception('Failed to save gallery image.');
                }

                $gallery_image_path_db = 'img/uploads/' . $gallery_image_name;
                mysqli_stmt_bind_param($stmt_gallery, "is", $product_id, $gallery_image_path_db);
                if (!mysqli_stmt_execute($stmt_gallery)) {
                    throw new Exception('Failed to insert gallery image: ' . mysqli_error($conn));
                }
            }
        }

        if (isset($_POST['Category']) && !empty($_POST['Category'])) {
            $categories = json_decode($_POST['Category']);
            $sql_category = "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)";
            $stmt_category = mysqli_prepare($conn, $sql_category);
            foreach ($categories as $category_id) {
                mysqli_stmt_bind_param($stmt_category, "ii", $product_id, $category_id);
                if (!mysqli_stmt_execute($stmt_category)) {
                    throw new Exception('Failed to insert category: ' . mysqli_error($conn));
                }
            }
        }

        if (isset($_POST['Tag']) && !empty($_POST['Tag'])) {
            $tags = json_decode($_POST['Tag']);
            $sql_tag = "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)";
            $stmt_tag = mysqli_prepare($conn, $sql_tag);
            foreach ($tags as $tag_id) {
                mysqli_stmt_bind_param($stmt_tag, "ii", $product_id, $tag_id);
                if (!mysqli_stmt_execute($stmt_tag)) {
                    throw new Exception('Failed to insert tag: ' . mysqli_error($conn));
                }
            }
        }

        mysqli_commit($conn);

        echo json_encode(['status' => 'success', 'message' => 'Product added successfully']);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

?>