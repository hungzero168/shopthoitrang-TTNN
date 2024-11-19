<?php
include 'connect.php';

$sql = "SELECT * FROM tags";
$result = mysqli_query($conn, $sql);
$tags = mysqli_fetch_all($result, MYSQLI_ASSOC);

echo json_encode(['tags' => $tags]);

mysqli_close($conn);
?>