<?php
include 'connect.php';

// Truy vấn lấy tất cả sản phẩm
$sql = "SELECT * FROM products WHERE status = 'active'";
$result = $conn->query($sql);

$products = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

// Trả về dữ liệu dạng JSON
header('Content-Type: application/json');
echo json_encode($products);

$conn->close();
?>
