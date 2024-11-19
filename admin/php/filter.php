<?php
include 'connect.php';



$filter = isset($_POST['filter']) ? $_POST['filter'] : $_GET;

if ($filter) {
    $query = "SELECT p.id, p.sku, p.title, p.price,
              p.sale_price, p.featured_image,
              p.created_date, p.modified_date,
              GROUP_CONCAT(DISTINCT pg.gallery_image) AS gallery,
              GROUP_CONCAT(DISTINCT c.category_name) AS categories,
              GROUP_CONCAT(DISTINCT t.tag_name) AS tags
              FROM products p
              LEFT JOIN product_gallery pg ON p.id = pg.product_id
              LEFT JOIN product_categories pc ON p.id = pc.product_id
              LEFT JOIN categories c ON pc.category_id = c.id
              LEFT JOIN product_tags pt ON p.id = pt.product_id
              LEFT JOIN tags t ON pt.tag_id = t.id
              WHERE 1=1";  
    $where_conditions = array();

    if (!empty($filter['Category'])) {
        $categories = implode(',', array_map('intval', (array) $filter['Category']));
        $where_conditions[] = "p.id IN (SELECT DISTINCT product_id 
                                        FROM product_categories 
                                        WHERE category_id IN ($categories))";
    }

    if (!empty($filter['Tag'])) {
        $tags = implode(',', array_map('intval', (array) $filter['Tag']));
        $where_conditions[] = "p.id IN (SELECT DISTINCT product_id 
                                        FROM product_tags 
                                        WHERE tag_id IN ($tags))";
    }

    if (!empty($filter['create_date']) && !empty($filter['update_date'])) {
        $where_conditions[] = "DATE(p.created_date) BETWEEN '" . mysqli_real_escape_string($conn, $filter['create_date']) . "' AND '" . mysqli_real_escape_string($conn, $filter['update_date']) . "'";
    } elseif (!empty($filter['create_date'])) {
        $where_conditions[] = "DATE(p.created_date) >= '" . mysqli_real_escape_string($conn, $filter['create_date']) . "'";
    } elseif (!empty($filter['update_date'])) {
        $where_conditions[] = "DATE(p.created_date) <= '" . mysqli_real_escape_string($conn, $filter['update_date']) . "'";
    }

    $price_from = isset($filter['price_from']) && $filter['price_from'] !== '' ? floatval($filter['price_from']) : null;
    $price_to = isset($filter['price_to']) && $filter['price_to'] !== '' ? floatval($filter['price_to']) : null;

    if ($price_from !== null && $price_to !== null) {
        if ($price_from == $price_to) {
            $where_conditions[] = "ROUND(p.price, 2) = ROUND($price_from, 2)";
        } else {
            $where_conditions[] = "p.price BETWEEN $price_from AND $price_to";
        }
    } elseif ($price_from !== null) {
        $where_conditions[] = "p.price >= $price_from";
    } elseif ($price_to !== null) {
        $where_conditions[] = "p.price <= $price_to";
    }

    if (!empty($where_conditions)) {
        $query .= " AND " . implode(" AND ", $where_conditions);
    }

    $query .= " GROUP BY p.id"; 

    if (!empty($filter['Date']) && !empty($filter['Order'])) {
        $field = mysqli_real_escape_string($conn, $filter['Date']);
        $order = $filter['Order'] === 'DESC' ? 'DESC' : 'ASC';
        
        switch ($field) {
            case 'date':
                $query .= " ORDER BY p.created_date " . $order;
                break;
            case 'name':
                $query .= " ORDER BY p.title " . $order;
                break;
            case 'sku':
                $query .= " ORDER BY p.sku " . $order;
                break;
            case 'price':
                $query .= " ORDER BY p.price " . $order;
                break;
        }
    }

    error_log($query);

    $result = mysqli_query($conn, $query);

    if ($result === false) {
        error_log("MySQL Error: " . mysqli_error($conn));
        echo json_encode(['status' => 'error', 'message' => 'Database query error.']);
    } elseif (mysqli_num_rows($result) > 0) {
        $products = mysqli_fetch_all($result, MYSQLI_ASSOC);
        echo json_encode(['status' => 'success', 'products' => $products]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No products found.']);
    }

    mysqli_close($conn);
    exit();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
    mysqli_close($conn);
    exit();
}
?>
