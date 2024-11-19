<?php
include 'connect.php';


if (!isset($conn) || !($conn instanceof mysqli)) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$urls = $data['urls'] ?? [];

if (empty($urls) && isset($_GET['urls'])) {
    $urls = explode(',', $_GET['urls']);
}

$results = [];
foreach ($urls as $url) {
    $content = @file_get_contents($url);
    if ($content === false) {
        $results[] = ['status' => 'error', 'message' => 'Failed to fetch content from URL: ' . $url];
        continue;
    }
    $product = extractProductData($content);
    $existingData = getExistingProductData($conn, $product['sku']);
    
    if (!empty($product['tags'])) {
        sort($product['tags']);
        $product['tags'] = array_filter($product['tags'], 'strlen');
    }
    
    $result = $existingData ? updateProduct($conn, $product, $existingData) : insertProduct($conn, $product);
    $results[] = $result;
}
echo json_encode([
    'status' => 'success', 'results' => $results
]);
$conn->close();

function extractProductData($content) {
    $product = [];

    if (preg_match('/<h1 class="product_title entry-title">(.*?)<\/h1>.*?SKU:\s*<span class="sku">([^<]+)<\/span>/s', $content, $matches)) {
        $product['title'] = str_replace('&#8211;', '-', $matches[1]);
        $product['sku'] = $matches[2];
    } else {
        preg_match('/<h1 class="product_title entry-title">(.*?)<\/h1>/s', $content, $matches);
        $product['title'] = str_replace('&#8211;', '-', $matches[1] ?? '');
        $product['sku'] = preg_replace('/^(?:\S+\s+)*\S+\s*-\s*/i', '', $product['title']);
    }
    $product['sku'] = strtolower(str_replace(' ', '-', $product['sku']));

    if (preg_match('/<p class="price">.*?<del.*?>(.*?)<\/del>.*?<ins.*?>(.*?)<\/ins>.*?<\/p>/s', $content, $matches)) {
        $product['price'] = preg_replace('/[^0-9.]/', '', strip_tags($matches[1]));
        $product['sale_price'] = preg_replace('/[^0-9.]/', '', strip_tags($matches[2]));
    } elseif (preg_match('/<p class="price">(.*?)<\/p>/s', $content, $matches)) {
        $product['price'] = $product['sale_price'] = preg_replace('/[^0-9.]/', '', strip_tags($matches[1]));
    } else {
        $product['price'] = $product['sale_price'] = '0';
    }

    foreach (['price', 'sale_price'] as $key) {
        $product[$key] = (strpos($product[$key], '36') === 0) ? substr($product[$key], 2) : $product[$key];
        $product[$key] = ($product[$key] === '' || $product[$key] === null) ? '0' : $product[$key];
    }

    preg_match_all('/<div[^>]*class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>.*?(?:data-src|src)="([^"]+)"/s', $content, $matches);
    $product['featured_image'] = $matches[1][0] ?? null;
    $product['gallery'] = array_slice(array_unique($matches[1]), 1);

    if (preg_match('/<div class="product_meta">(.*?)<\/div>/s', $content, $meta_matches)) {
        $meta_content = $meta_matches[1];
        preg_match('/<span class="posted_in">Category: <a[^>]*>(.*?)<\/a><\/span>/s', $meta_content, $cat_matches);
        $product['category'] = $cat_matches[1] ?? null;

        if (preg_match('/<span class="tagged_as">Tags: (.*?)<\/span>/s', $meta_content, $tag_matches)) {
            preg_match_all('/<a[^>]*>(.*?)<\/a>/s', $tag_matches[1], $tag_list_matches);
            $product['tags'] = $tag_list_matches[1] ?? null;
        } else {
            $product['tags'] = null;
        }
    } else {
        $product['category'] = null;
        $product['tags'] = null;
    }

    preg_match('/"datePublished":"([^"]+)".*?"dateModified":"([^"]+)"/s', $content, $matches);
    $product['date_published'] = isset($matches[1]) ? date('d/m/Y', strtotime($matches[1])) : null;
    $product['date_modified'] = isset($matches[2]) ? date('d/m/Y', strtotime($matches[2])) : null;

    return $product;
}

function getExistingProductData($conn, $sku) {
    static $stmt = null;
    if ($stmt === null) {
        $stmt = $conn->prepare("SELECT p.id, p.sku, p.title, p.price, p.sale_price, p.featured_image, 
                                DATE(p.created_date) as created_date, 
                                DATE(p.modified_date) as modified_date, 
                                c.category_name, 
                                GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name ASC) as tags
                                FROM products p
                                LEFT JOIN product_categories pc ON p.id = pc.product_id
                                LEFT JOIN categories c ON pc.category_id = c.id
                                LEFT JOIN product_tags pt ON p.id = pt.product_id
                                LEFT JOIN tags t ON pt.tag_id = t.id
                                WHERE p.sku = ?
                                GROUP BY p.id");
    }
    $stmt->bind_param('s', $sku);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function formatDate($date) {
    if (!$date) return null;
    $dateObj = DateTime::createFromFormat('d/m/Y', $date);
    return $dateObj ? $dateObj->format('Y-m-d') : null;
}

function compareArrays($arr1, $arr2) {
    $arr1 = array_filter(is_array($arr1) ? $arr1 : explode(',', $arr1 ?? ''), 'strlen');
    $arr2 = array_filter(is_array($arr2) ? $arr2 : explode(',', $arr2 ?? ''), 'strlen');
    sort($arr1);
    sort($arr2);
    return $arr1 === $arr2;
}

function updateProduct($conn, $product, $existingData) {
    $price = !empty($product['price']) ? (float)$product['price'] : 0;
    $sale_price = !empty($product['sale_price']) ? (float)$product['sale_price'] : $price;
    $created_date = formatDate($product['date_published']);
    $modified_date = formatDate($product['date_modified']);

    $basicDataChanged = ($existingData['title'] != $product['title'] ||
                       $existingData['price'] != $price ||
                       $existingData['sale_price'] != $sale_price ||
                       $existingData['featured_image'] != $product['featured_image'] ||
                       $existingData['created_date'] != $created_date ||
                       $existingData['modified_date'] != $modified_date);

    $categoryChanged = !compareArrays($existingData['category_name'], $product['category']);
    $tagsChanged = !compareArrays($existingData['tags'], $product['tags']);

    if (!$basicDataChanged && !$categoryChanged && !$tagsChanged) {
        return ['status' => 'success', 'message' => 'No changes detected', 'is_new_product' => false];
    }

    if ($basicDataChanged) {
        $stmt = $conn->prepare("UPDATE products SET 
            title = ?, price = ?, sale_price = ?, featured_image = ?, 
            created_date = ?, modified_date = ? WHERE sku = ?");
        $stmt->bind_param('sddssss', 
            $product['title'], $price, $sale_price, $product['featured_image'], 
            $created_date, $modified_date, $product['sku']
        );
        $stmt->execute();
    }

    $product_id = $existingData['id'];

    if ($categoryChanged) {
        updateCategory($conn, $product_id, $product['category']);
    }

    if ($tagsChanged) {
        updateTags($conn, $product_id, $product['tags']);
    }

    return ['status' => 'success', 'message' => 'Product updated successfully', 'is_new_product' => false];
}

function insertProduct($conn, $product) {
    $price = !empty($product['price']) ? (float)$product['price'] : 0;
    $sale_price = !empty($product['sale_price']) ? (float)$product['sale_price'] : $price;
    $created_date = formatDate($product['date_published']);
    $modified_date = formatDate($product['date_modified']);

    $stmt = $conn->prepare("INSERT INTO products (sku, title, price, sale_price, featured_image, created_date, modified_date) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('ssddsss', 
        $product['sku'], $product['title'], $price, $sale_price, 
        $product['featured_image'], $created_date, $modified_date
    );
    $stmt->execute();
    $product_id = $stmt->insert_id;

    if (!empty($product['gallery'])) {
        insertGallery($conn, $product_id, $product['gallery']);
    }

    if (!empty($product['category'])) {
        updateCategory($conn, $product_id, $product['category']);
    }

    if (!empty($product['tags'])) {
        updateTags($conn, $product_id, $product['tags']);
    }

    return ['status' => 'success', 'message' => 'Product saved successfully', 'is_new_product' => true];
}

function updateCategory($conn, $product_id, $category) {
    $conn->query("DELETE FROM product_categories WHERE product_id = $product_id");
    $conn->query("INSERT IGNORE INTO categories (category_name) VALUES ('" . $conn->real_escape_string($category) . "')");
    $category_id = $conn->insert_id ?: $conn->query("SELECT id FROM categories WHERE category_name = '" . $conn->real_escape_string($category) . "'")->fetch_object()->id;
    $conn->query("INSERT INTO product_categories (product_id, category_id) VALUES ($product_id, $category_id)");
}

function updateTags($conn, $product_id, $tags) {
    $conn->query("DELETE FROM product_tags WHERE product_id = $product_id");
    if (!empty($tags)) {
        $tagValues = array_map(function($tag) use ($conn) {
            return "('" . $conn->real_escape_string(trim($tag)) . "')";
        }, array_filter($tags, 'strlen'));
        if (!empty($tagValues)) {
            $conn->query("INSERT IGNORE INTO tags (tag_name) VALUES " . implode(',', $tagValues));
            $tagIds = $conn->query("SELECT id FROM tags WHERE tag_name IN ('" . implode("','", array_map([$conn, 'real_escape_string'], $tags)) . "')")->fetch_all(MYSQLI_ASSOC);
            $tagProductValues = array_map(function($tagId) use ($product_id) {
                return "($product_id, {$tagId['id']})";
            }, $tagIds);
            $conn->query("INSERT INTO product_tags (product_id, tag_id) VALUES " . implode(',', $tagProductValues));
        }
    }
}

function insertGallery($conn, $product_id, $gallery) {
    $galleryValues = array_map(function($image) use ($product_id, $conn) {
        return "($product_id, '" . $conn->real_escape_string(trim($image)) . "')";
    }, array_filter($gallery, 'strlen'));
    if (!empty($galleryValues)) {
        $conn->query("INSERT INTO product_gallery (product_id, gallery_image) VALUES " . implode(',', $galleryValues));
    }
}
?>