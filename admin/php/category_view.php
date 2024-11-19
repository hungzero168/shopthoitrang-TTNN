<?php
include 'connect.php';
$sql = "SELECT * FROM categories";
$result = mysqli_query($conn, $sql);
$categories = mysqli_fetch_all($result, MYSQLI_ASSOC);
echo json_encode(['categories' => $categories]);
mysqli_close($conn);
?>


