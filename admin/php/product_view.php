<?php
include 'connect.php';

$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$limit = 5;
$offset = ($page - 1) * $limit;

$sql = "SELECT p.id, p.sku, p.title, p.price, p.sale_price, p.featured_image,
        p.description, p.created_date, p.modified_date,
        GROUP_CONCAT(DISTINCT g.gallery_image) AS gallery,
        GROUP_CONCAT(DISTINCT c.category_name) AS categories,
        GROUP_CONCAT(DISTINCT t.tag_name) AS tags
        FROM products p
        LEFT JOIN product_gallery g ON p.id = g.product_id
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN product_tags pt ON p.id = pt.product_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        GROUP BY p.id
LIMIT $limit OFFSET $offset;";

if ($result = mysqli_query($conn, $sql)) {
    $products = mysqli_fetch_all($result, MYSQLI_ASSOC);

    $count_sql = "SELECT COUNT(*) as total FROM products;";
    $count_result = mysqli_query($conn, $count_sql);
    $total_row = mysqli_fetch_assoc($count_result);
    $total_products = $total_row['total'];

    echo json_encode(['products' => $products, 'total' => $total_products]);

    mysqli_free_result($result);
    mysqli_free_result($count_result);
} else {
    echo json_encode(['error' => 'Query failed: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>