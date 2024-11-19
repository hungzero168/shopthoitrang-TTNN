<?php
include 'connect.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get product ID from query parameter
$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($productId > 0) {
    // SQL query to get product details
    $sql = "SELECT p.*, 
            GROUP_CONCAT(DISTINCT c.category_name) as categories,
            GROUP_CONCAT(DISTINCT t.tag_name) as tags,
            GROUP_CONCAT(DISTINCT pg.gallery_image) as gallery_images
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id 
            LEFT JOIN categories c ON pc.category_id = c.id
            LEFT JOIN product_tags pt ON p.id = pt.product_id
            LEFT JOIN tags t ON pt.tag_id = t.id 
            LEFT JOIN product_gallery pg ON p.id = pg.product_id
            WHERE p.id = $productId AND p.status = 'active'
            GROUP BY p.id";

    $result = $conn->query($sql);

    if ($result && $product = $result->fetch_assoc()) {
        // Convert gallery images string to array
        $product['gallery_images'] = $product['gallery_images'] ? explode(',', $product['gallery_images']) : [];
        $product['categories'] = $product['categories'] ? explode(',', $product['categories']) : [];
        $product['tags'] = $product['tags'] ? explode(',', $product['tags']) : [];

        // Return product data as JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $product
        ]);
    } else {
        // Product not found
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Product not found'
        ]);
    }
} else {
    // Invalid product ID
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product ID'
    ]);
}

// Close database connection
$conn->close();
?>



