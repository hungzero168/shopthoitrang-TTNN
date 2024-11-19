<?php
session_start();

// Set JSON content type header once
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['email'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

require_once '../php/connect.php';

// Handle POST request for profile updates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get POST data
        $fullName = $_POST['full_name'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $address = $_POST['address'] ?? '';
        $email = $_SESSION['email'];

        // Validate data
        if (empty($fullName) || empty($phone) || empty($address)) {
            echo json_encode([
                'success' => false,
                'message' => 'Vui lòng điền đầy đủ thông tin!'
            ]);
            exit;
        }

        // Validate phone number format
        if (!preg_match('/^[0-9]{10,11}$/', $phone)) {
            echo json_encode([
                'success' => false,
                'message' => 'Số điện thoại không hợp lệ!'
            ]);
            exit;
        }

        // Validate full name length
        if (strlen($fullName) > 100) {
            echo json_encode([
                'success' => false,
                'message' => 'Họ tên không được vượt quá 100 ký tự!'
            ]); 
            exit;
        }

        // Update user info
        $stmt = $conn->prepare("UPDATE users SET full_name = ?, phone = ?, address = ?, modified_date = CURRENT_TIMESTAMP WHERE email = ?");
        $stmt->bind_param("ssss", $fullName, $phone, $address, $email);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cập nhật thông tin thành công!']);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi cập nhật. Vui lòng thử lại!'
            ]);
        }

        $stmt->close();

    } catch (Exception $e) {
        error_log($e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Lỗi cập nhật. Vui lòng thử lại!'
        ]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
    exit;
}

// Get user profile data
try {
    // Get user info by email from session using specific columns
    $stmt = $conn->prepare("SELECT full_name, email, phone, address, created_date 
                           FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $_SESSION['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Return user data directly without creating intermediate array
    echo json_encode($user);

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
