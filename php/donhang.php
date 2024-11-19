<?php
session_start();

// Set JSON content type header
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['email'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

require_once '../php/connect.php';

try {
    // Get user ID from email
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $_SESSION['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Get orders for this user with full information
    $stmt = $conn->prepare("
        SELECT o.id, o.total_amount, o.created_date, o.order_status, 
               o.shipping_address, o.shipping_phone, o.shipping_name,
               o.payment_method, o.payment_status,
               oi.product_id, oi.quantity, oi.price,
               p.title, p.featured_image
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_date DESC
    ");
    
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    $current_order = null;

    while ($row = $result->fetch_assoc()) {
        if (!isset($orders[$row['id']])) {
            $orders[$row['id']] = [
                'id' => $row['id'],
                'total_amount' => $row['total_amount'],
                'created_date' => $row['created_date'],
                'order_status' => $row['order_status'],
                'shipping_address' => $row['shipping_address'],
                'shipping_phone' => $row['shipping_phone'], 
                'shipping_name' => $row['shipping_name'],
                'payment_method' => $row['payment_method'],
                'payment_status' => $row['payment_status'],
                'items' => []
            ];
        }
        
        if ($row['product_id']) {
            $orders[$row['id']]['items'][] = [
                'product_id' => $row['product_id'],
                'title' => $row['title'],
                'quantity' => $row['quantity'],
                'price' => $row['price'],
                'featured_image' => $row['featured_image']
            ];
        }
    }

    echo json_encode(array_values($orders));

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['error' => 'Internal server error']);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>
