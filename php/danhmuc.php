<?php
require_once '../php/connect.php';

// Set JSON content type header
header('Content-Type: application/json');

try {
    // Get all categories
    $sql = "SELECT * FROM categories";
    $result = $conn->query($sql);

    $categories = array();
    while($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    echo json_encode($categories);

} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
