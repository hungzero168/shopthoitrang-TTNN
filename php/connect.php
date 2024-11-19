<?php
$nameserver = "localhost";
$username = "root";
$password = "";
$database = "shopthoitrang";

$conn = mysqli_connect($nameserver, $username, $password, $database);
$conn->set_charset("utf8");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>
