<?php
$target = $_GET['target'];

if (filter_var($target, FILTER_VALIDATE_URL) === false) {
    echo 'URL not valid.';
    exit;
}
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $target);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Error: ' . curl_error($ch);
} else {
    echo $response;
}


curl_close($ch);
?>
