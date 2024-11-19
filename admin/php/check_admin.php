<?php
session_start();
header('Content-Type: application/json');

function checkAdmin() {
    // Check if user is logged in and has admin role
    if (isset($_SESSION['admin_id']) && isset($_SESSION['admin_role']) && isset($_SESSION['admin_email'])) {
        if ($_SESSION['admin_role'] === 'admin') {
            // Check if the session is not expired (30 minutes)
            if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] < 1800)) {
                // Update last activity time
                $_SESSION['last_activity'] = time();
                echo json_encode(['status' => 'success', 'authenticated' => true]);
                exit();
            }
        }
        echo json_encode(['status' => 'error', 'authenticated' => false, 'message' => 'Invalid role or session expired']);
        exit();
    }

    // Clear all session data
    session_unset();
    session_destroy();
    
    // Ensure the browser doesn't cache the redirect
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    
    echo json_encode(['status' => 'error', 'authenticated' => false, 'message' => 'Please login']);
    exit();
}

// Call checkAdmin function
checkAdmin();

// Security headers
header("X-XSS-Protection: 1; mode=block");
header("X-Frame-Options: SAMEORIGIN"); // Changed from DENY to allow framing on same origin
header("Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; img-src 'self' data: https:;");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");

// Enforce HTTPS only in production
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    $redirect_url = "https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $redirect_url");
    exit();
}

// Debug logging
error_log("Admin check passed for user ID: " . $_SESSION['admin_id']);
?>
