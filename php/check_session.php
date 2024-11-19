<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

$response = [
    'loggedIn' => false,
    'user' => null
];

if (isset($_SESSION['user_id']) && isset($_SESSION['email']) && isset($_SESSION['role'])) {
    // Verify user still exists and is active
    $sql = "SELECT status FROM users WHERE id = ? AND email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "is", $_SESSION['user_id'], $_SESSION['email']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        if ($row['status'] == 'active') {
            $response['loggedIn'] = true;
            $response['user'] = [
                'id' => $_SESSION['user_id'],
                'email' => $_SESSION['email'],
                'role' => $_SESSION['role']
            ];
        } else {
            // Clear session if user is inactive
            session_destroy();
        }
    } else {
        // Clear session if user no longer exists
        session_destroy();
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
}

echo json_encode($response);
?>