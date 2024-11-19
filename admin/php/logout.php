<?php
session_start();

// Clear all session data
session_unset();
session_destroy();

// Ensure the browser doesn't cache the redirect
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Log the logout event
error_log("Admin logged out: " . (isset($_SESSION['admin_email']) ? $_SESSION['admin_email'] : 'Unknown user'));

// Return success response
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>
