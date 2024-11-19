<?php
include 'connect.php';


$product_name = mysqli_real_escape_string($conn, $_GET['product_name']);

$sql = "SELECT p.*, 
            GROUP_CONCAT(DISTINCT c.category_name) AS categories,
            GROUP_CONCAT(DISTINCT t.tag_name) AS tags
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            LEFT JOIN product_tags pt ON p.id = pt.product_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.title LIKE ?
            GROUP BY p.id";

$stmt = mysqli_prepare($conn, $sql);
$search_term = "%$product_name%";
mysqli_stmt_bind_param($stmt, "s", $search_term);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($result) {
    if (mysqli_num_rows($result) > 0) {
        $products = mysqli_fetch_all($result, MYSQLI_ASSOC);
        
        foreach ($products as &$product) {
            $product['categories'] = $product['categories'] ? explode(',', $product['categories']) : [];
            $product['tags'] = $product['tags'] ? explode(',', $product['tags']) : [];
        }

        echo json_encode(['status' => 'success', 'products' => $products]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No products found']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Query failed: ' . mysqli_error($conn)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>