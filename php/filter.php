<?php
require_once 'connect.php';
header('Content-Type: application/json');

// Get filter parameters from URL and sanitize
$category = isset($_GET['category']) ? removeVietnameseAccents(strtolower($_GET['category'])) : '';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$minPrice = isset($_GET['min_price']) ? floatval($_GET['min_price']) : 0;
$maxPrice = isset($_GET['max_price']) ? floatval($_GET['max_price']) : PHP_FLOAT_MAX;
$sortBy = isset($_GET['sort']) ? $_GET['sort'] : '';

// Build base query
$sql = "SELECT DISTINCT p.* 
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id 
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.status = 'active'";

$params = array();
$types = "";

// Add category filter if specified
if ($category !== '') {
    $sql .= " AND (LOWER(REPLACE(c.category_name, ' ', '')) LIKE ? OR LOWER(REPLACE(p.title, ' ', '')) LIKE ?)";
    $searchCategory = '%' . removeVietnameseAccents(str_replace(' ', '', $category)) . '%';
    $params[] = $searchCategory;
    $params[] = $searchCategory;
    $types .= "ss";
}

// Add search filter if specified
if ($search !== '') {
    if ($category !== '') {
        $sql .= " OR"; // Add OR if category filter exists
    } else {
        $sql .= " AND"; // Add AND if no category filter
    }
    $sql .= " p.title LIKE ?";
    $params[] = '%' . $search . '%';
    $types .= "s";
}

// Add price range filter
$sql .= " AND (p.sale_price > 0 AND p.sale_price BETWEEN ? AND ? OR p.price BETWEEN ? AND ?)";
$params[] = $minPrice;
$params[] = $maxPrice;
$params[] = $minPrice;
$params[] = $maxPrice;
$types .= "dddd";

// Add sorting
switch($sortBy) {
    case 'price-asc':
        $sql .= " ORDER BY CASE WHEN p.sale_price > 0 THEN p.sale_price ELSE p.price END ASC";
        break;
    case 'price-desc':
        $sql .= " ORDER BY CASE WHEN p.sale_price > 0 THEN p.sale_price ELSE p.price END DESC";
        break;
    case 'name-asc':
        $sql .= " ORDER BY p.title ASC";
        break;
    case 'name-desc':
        $sql .= " ORDER BY p.title DESC";
        break;
    default:
        $sql .= " ORDER BY p.id DESC";
}

$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$products = array();
while($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);

function removeVietnameseAccents($str) {
    $accents_arr = array(
        'a' => array('á', 'à', 'ả', 'ã', 'ạ', 'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'),
        'e' => array('é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'),
        'i' => array('í', 'ì', 'ỉ', 'ĩ', 'ị'),
        'o' => array('ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'),
        'u' => array('ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'),
        'y' => array('ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'),
        'd' => array('đ'),
    );

    foreach ($accents_arr as $non_accent => $accents) {
        $str = str_replace($accents, $non_accent, $str);
    }

    return $str;
}
