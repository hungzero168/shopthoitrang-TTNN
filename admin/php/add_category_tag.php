<?php
include 'connect.php';

$property_type = $_POST['property_type'];
$property_name = $_POST['property_name'];

if ($property_type == 'category') {
    $sql = "INSERT INTO categories (category_name) VALUES ('$property_name')";
} else if ($property_type == 'tag') {
    $sql = "INSERT INTO tags (tag_name) VALUES ('$property_name')";
}

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Property added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add property']);
}

mysqli_close($conn);
?>