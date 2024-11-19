<?php
require_once 'connect.php';

if (isset($_POST['delete_all_products'])) {
    $query = "DELETE FROM products";
    $result = mysqli_query($conn, $query);

    if ($result) {
        echo json_encode(['status' => 'success', 'message' => 'All products have been deleted.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Please try again.']);
    }
    mysqli_close($conn);
    exit();
    
}
?>
