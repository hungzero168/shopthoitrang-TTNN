<?php
session_start();
require_once 'connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];
    $remember = isset($_POST['remember']) ? $_POST['remember'] : false;
    
    // Debug logging
    error_log("Login attempt - Email: " . $email);
    
    // Validate input
    if (empty($email) || empty($password)) {
        error_log("Empty email or password");
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin']);
        exit;
    }

    // Check email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Invalid email format: " . $email);
        echo json_encode(['success' => false, 'message' => 'Email không hợp lệ']);
        exit;
    }

    // Check password length
    if (strlen($password) < 6) {
        error_log("Password too short");
        echo json_encode(['success' => false, 'message' => 'Mật khẩu phải có ít nhất 6 ký tự']);
        exit;
    }

    // Query to check user credentials
    $sql = "SELECT id, email, password, role, status FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    error_log("SQL Query executed - Found user: " . ($result->num_rows > 0 ? "Yes" : "No"));

    if ($row = mysqli_fetch_assoc($result)) {
        error_log("User status: " . $row['status']);
        
        if ($row['status'] == 'inactive') {
            echo json_encode(['success' => false, 'message' => 'Tài khoản đã bị vô hiệu hóa']);
            exit;
        }

        // Compare plain text passwords since database stores them as plain text
        if ($password === $row['password']) {
            // Set session variables
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['role'] = $row['role'];

            error_log("Session variables set - ID: " . $_SESSION['user_id'] . ", Email: " . $_SESSION['email'] . ", Role: " . $_SESSION['role']);

            // Return response with session data
            $response = [
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'role' => $row['role'],
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'email' => $_SESSION['email'],
                    'role' => $_SESSION['role']
                ]
            ];
            echo json_encode($response);
        } else {
            error_log("Password mismatch for user: " . $email);
            echo json_encode(['success' => false, 'message' => 'Mật khẩu không chính xác']);
        }
    } else {
        error_log("Email not found: " . $email);
        echo json_encode(['success' => false, 'message' => 'Email không tồn tại']);
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
} else {
    error_log("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
