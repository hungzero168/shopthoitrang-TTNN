<?php
require_once 'connect.php';


if (isset($_GET['id'])) {
    $id = mysqli_real_escape_string($conn, $_GET['id']);
    $query = "SELECT p.id, p.sku, p.title, p.price, p.sale_price, p.featured_image,
            p.description, p.created_date, p.modified_date,
            GROUP_CONCAT(DISTINCT g.gallery_image) AS gallery,
            GROUP_CONCAT(DISTINCT c.category_name) AS categories,
            GROUP_CONCAT(DISTINCT c.id) AS category_ids,
            GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
            GROUP_CONCAT(DISTINCT t.id) AS tag_ids
            FROM products p
            LEFT JOIN product_gallery g ON p.id = g.product_id
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            LEFT JOIN product_tags pt ON p.id = pt.product_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.id = '$id'
            GROUP BY p.id";

    $result = mysqli_query($conn, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $product = mysqli_fetch_assoc($result);

        $response = [
            'status' => 'success',
            'product' => [
                'id' => $product['id'],
                'sku' => $product['sku'],
                'title' => $product['title'],
                'price' => $product['price'],
                'sale_price' => $product['sale_price'],
                'featured_image' => $product['featured_image'],
                'description' => $product['description'],
                'created_date' => $product['created_date'],
                'modified_date' => $product['modified_date'],
                'gallery' => $product['gallery'] ? explode(',', $product['gallery']) : [],
                'categories' => $product['categories'] ? explode(',', $product['categories']) : [],
                'category_ids' => $product['category_ids'] ? explode(',', $product['category_ids']) : [],
                'tags' => $product['tags'] ? explode(',', $product['tags']) : [],
                'tag_ids' => $product['tag_ids'] ? explode(',', $product['tag_ids']) : []
            ]
        ];

        echo json_encode($response);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Product not found.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    mysqli_begin_transaction($conn);

    try {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        $new_sku = filter_input(INPUT_POST, 'sku', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $title = filter_input(INPUT_POST, 'product_name', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $price = filter_input(INPUT_POST, 'product_price', FILTER_VALIDATE_FLOAT);
        $sale_price = filter_input(INPUT_POST, 'sale_price', FILTER_VALIDATE_FLOAT);

        if (!$id || !$new_sku || !$title) {
            throw new Exception('Invalid input data');
        }

        $getCurrentSkuQuery = "SELECT sku FROM products WHERE id = ?";
        $getCurrentSkuStmt = mysqli_prepare($conn, $getCurrentSkuQuery);
        mysqli_stmt_bind_param($getCurrentSkuStmt, "i", $id);
        mysqli_stmt_execute($getCurrentSkuStmt);
        $result = mysqli_stmt_get_result($getCurrentSkuStmt);
        $row = mysqli_fetch_assoc($result);
        $current_sku = $row['sku'];

        if ($new_sku !== $current_sku) {
            $checkSkuQuery = "SELECT id FROM products WHERE sku = ? AND id != ?";
            $checkSkuStmt = mysqli_prepare($conn, $checkSkuQuery);
            mysqli_stmt_bind_param($checkSkuStmt, "si", $new_sku, $id);
            mysqli_stmt_execute($checkSkuStmt);
            $result = mysqli_stmt_get_result($checkSkuStmt);
            if (mysqli_num_rows($result) > 0) {
                mysqli_rollback($conn);
                echo json_encode(['status' => 'error', 'message' => 'SKU already exists for another product. Update cancelled.']);
                exit;
            }
        }

        $featured_image = ''; 
        if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../img/uploads/';
            $file_name = uniqid() . '_' . basename($_FILES['featured_image']['name']);
            $upload_path = $upload_dir . $file_name;

            if (move_uploaded_file($_FILES['featured_image']['tmp_name'], $upload_path)) {
                $featured_image = $upload_path;
            } else {
                throw new Exception('Failed to upload featured image.');
            }
        }

        $gallery_images = [];
        if (isset($_FILES['gallery_images'])) {
            $file_count = count($_FILES['gallery_images']['name']);
            for ($i = 0; $i < $file_count; $i++) {
                if ($_FILES['gallery_images']['error'][$i] === UPLOAD_ERR_OK) {
                    $upload_dir = '../img/uploads/';
                    $file_name = uniqid() . '_' . basename($_FILES['gallery_images']['name'][$i]);
                    $upload_path = $upload_dir . $file_name;

                    if (move_uploaded_file($_FILES['gallery_images']['tmp_name'][$i], $upload_path)) {
                        $gallery_images[] = $upload_path;
                    } else {
                        throw new Exception('Failed to upload gallery image: ' . $_FILES['gallery_images']['name'][$i]);
                    }
                }
            }
        }

        $existing_gallery_images = isset($_POST['existing_gallery_images']) ? $_POST['existing_gallery_images'] : [];

        $modified_date = date('Y-m-d H:i:s');

        $query = "UPDATE products SET sku = ?, title = ?, price = ?, sale_price = ?, modified_date = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "ssddsi", $new_sku, $title, $price, $sale_price, $modified_date, $id);
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to update product: ' . mysqli_error($conn));
        }

        if ($featured_image) {
            $updateImageQuery = "UPDATE products SET featured_image = ? WHERE id = ?";
            $updateImageStmt = mysqli_prepare($conn, $updateImageQuery);
            mysqli_stmt_bind_param($updateImageStmt, "si", $featured_image, $id);
            if (!mysqli_stmt_execute($updateImageStmt)) {
                throw new Exception('Failed to update featured image: ' . mysqli_error($conn));
            }
        }

        $deleteGalleryQuery = "DELETE FROM product_gallery WHERE product_id = ?";
        $deleteGalleryStmt = mysqli_prepare($conn, $deleteGalleryQuery);
        mysqli_stmt_bind_param($deleteGalleryStmt, "i", $id);
        if (!mysqli_stmt_execute($deleteGalleryStmt)) {
            throw new Exception('Failed to delete existing gallery images: ' . mysqli_error($conn));
        }

        $insertGalleryQuery = "INSERT INTO product_gallery (product_id, gallery_image) VALUES (?, ?)";
        $insertGalleryStmt = mysqli_prepare($conn, $insertGalleryQuery);
        
        $all_gallery_images = array_unique(array_merge($existing_gallery_images, $gallery_images));
        
        foreach ($all_gallery_images as $gallery_image) {
            mysqli_stmt_bind_param($insertGalleryStmt, "is", $id, $gallery_image);
            if (!mysqli_stmt_execute($insertGalleryStmt)) {
                throw new Exception('Failed to insert gallery image: ' . mysqli_error($conn));
            }
        }

        $deleteCategoriesQuery = "DELETE FROM product_categories WHERE product_id = ?";
        $deleteCategoriesStmt = mysqli_prepare($conn, $deleteCategoriesQuery);
        mysqli_stmt_bind_param($deleteCategoriesStmt, "i", $id);
        if (!mysqli_stmt_execute($deleteCategoriesStmt)) {
            throw new Exception('Failed to delete existing categories: ' . mysqli_error($conn));
        }

        if (isset($_POST['category']) && !empty($_POST['category'])) {
            $categories = array_filter($_POST['category'], 'is_numeric');

            $insertCategoryQuery = "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)";
            $insertCategoryStmt = mysqli_prepare($conn, $insertCategoryQuery);

            foreach ($categories as $category_id) {
                mysqli_stmt_bind_param($insertCategoryStmt, "ii", $id, $category_id);
                if (!mysqli_stmt_execute($insertCategoryStmt)) {
                    throw new Exception('Failed to insert category: ' . mysqli_error($conn));
                }
            }
        }

        $deleteTagsQuery = "DELETE FROM product_tags WHERE product_id = ?";
        $deleteTagsStmt = mysqli_prepare($conn, $deleteTagsQuery);
        mysqli_stmt_bind_param($deleteTagsStmt, "i", $id);
        if (!mysqli_stmt_execute($deleteTagsStmt)) {
            throw new Exception('Failed to delete existing tags: ' . mysqli_error($conn));
        }

        if (isset($_POST['tag']) && !empty($_POST['tag'])) {
            $tags = array_filter($_POST['tag'], 'is_numeric');

            $insertTagQuery = "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)";
            $insertTagStmt = mysqli_prepare($conn, $insertTagQuery);

            foreach ($tags as $tag_id) {
                mysqli_stmt_bind_param($insertTagStmt, "ii", $id, $tag_id);
                if (!mysqli_stmt_execute($insertTagStmt)) {
                    throw new Exception('Failed to insert tag: ' . mysqli_error($conn));
                }
            }
        }

        mysqli_commit($conn);

        echo json_encode(['status' => 'success', 'message' => 'Product updated successfully']);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        error_log('Error updating product: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        echo json_encode(['status' => 'error', 'message' => 'Error updating product: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

?>