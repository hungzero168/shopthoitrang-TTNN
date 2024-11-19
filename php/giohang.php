<?php
include 'connect.php';
session_start();

// Handle adding item to cart if ID is provided
if (isset($_GET['id'])) {
    $product_id = $_GET['id'];

    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập để thêm vào giỏ hàng']);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    // Check if product exists
    $sql = "SELECT * FROM products WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();

    if (!$product) {
        echo json_encode(['success' => false, 'message' => 'Sản phẩm không tồn tại']);
        exit;
    }

    // Get quantity from request if provided
    $quantity = isset($_GET['quantity']) ? intval($_GET['quantity']) : 1;

    // Check if cart exists for user
    $sql = "SELECT * FROM carts WHERE user_id = ? AND product_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update quantity if product already in cart
        if (isset($_GET['quantity'])) {
            // If quantity specified, add that amount
            $sql = "UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iii", $quantity, $user_id, $product_id);
        } else {
            // If no quantity specified, add 1
            $sql = "UPDATE carts SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $user_id, $product_id);
        }
    } else {
        // Add new cart item
        $sql = "INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $user_id, $product_id, $quantity);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Đã thêm sản phẩm vào giỏ hàng']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Có lỗi xảy ra, vui lòng thử lại']);
    }
}

// Display cart contents for GET requests without ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập để xem giỏ hàng']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    
    $sql = "SELECT c.*, p.title, p.price, p.sale_price, p.featured_image, p.stock_quantity
            FROM carts c
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $carts = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($carts);
}

// Handle updating cart item quantity
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = $data['product_id'];
    $cart_id = $data['cart_id'];
    $change = $data['change'];

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập']);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    // Get current quantity
    $sql = "SELECT quantity FROM carts WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $cart_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $cart = $result->fetch_assoc();

    $new_quantity = $cart['quantity'] + $change;

    if ($new_quantity <= 0) {
        // Remove item if quantity becomes 0 or negative
        $sql = "DELETE FROM carts WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $cart_id, $user_id);
    } else {
        // Update quantity
        $sql = "UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $new_quantity, $cart_id, $user_id);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Có lỗi xảy ra']);
    }
}

// Handle removing cart item
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'remove') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = $data['product_id'];
    $cart_id = $data['cart_id'];

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập']);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    $sql = "DELETE FROM carts WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $cart_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Có lỗi xảy ra']);
    }
}

// Handle creating order from cart
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'create_order') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        // Start transaction
        $conn->begin_transaction();

        // Create order
        $sql = "INSERT INTO orders (user_id, total_amount, shipping_address, shipping_phone, shipping_name, payment_method) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("idssss", $user_id, $data['total_amount'], $data['shipping_address'], 
                         $data['shipping_phone'], $data['shipping_name'], $data['payment_method']);
        $stmt->execute();
        $order_id = $conn->insert_id;

        // Get cart items
        $sql = "SELECT c.*, p.price, p.sale_price 
                FROM carts c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $cart_items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // Create order items
        $sql = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        foreach ($cart_items as $item) {
            $price = $item['sale_price'] > 0 ? $item['sale_price'] : $item['price'];
            $stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $price);
            $stmt->execute();
        }

        // Clear cart
        $sql = "DELETE FROM carts WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        // Commit transaction
        $conn->commit();
        echo json_encode(['success' => true, 'order_id' => $order_id]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Có lỗi xảy ra khi tạo đơn hàng']);
    }
}

$stmt->close();
$conn->close();
?>