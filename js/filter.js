document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const productGrid = document.getElementById('productGrid');
    const categoryTitle = document.getElementById('categoryTitle');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar button');

    // Function to format price with VND currency
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    // Function to render a single product
    function renderProduct(product, index) {
        const displayPrice = product.sale_price > 0 ? product.sale_price : product.price;
        const originalPrice = product.sale_price > 0 ? product.price : null;

        // Hide product if status is inactive
        if (product.status === 'inactive') {
            return '';
        }

        return `
                    <div class="col-md-3 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="card product-card h-100">
                            <div class="position-relative">
                                <img src="${product.featured_image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;" />
                                ${product.stock_quantity < 10 && product.stock_quantity > 0 ?
                `<span class="badge bg-warning position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">Sắp hết</span>` :
                product.stock_quantity === 0 ?
                    `<span class="badge bg-secondary position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">Hết hàng</span>` :
                    product.sale_price > 0 ?
                        `<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">-${Math.round((1 - product.sale_price / product.price) * 100)}%</span>` :
                        product.created_date && new Date(product.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ?
                            `<span class="badge bg-success position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">Mới</span>` :
                            ''}
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h3 class="card-title h6 text-center mb-2" style="min-height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${product.title}</h3>
                                <div class="price text-center mb-2">
                                    ${product.sale_price > 0 ?
                `<div>
                                            <span class="current text-primary fw-bold" style="font-size: 1rem;">${parseInt(product.sale_price).toLocaleString()} VNĐ </span>
                                        </div>
                                        <div>
                                            <span class="original text-muted text-decoration-line-through" style="font-size: 0.8rem;">${parseInt(product.price).toLocaleString()} VNĐ</span>
                                        </div>` :
                `<span class="current text-primary fw-bold" style="font-size: 1rem;">${parseInt(product.price).toLocaleString()} VNĐ</span>`
            }
                                </div>
                                <div class="product-actions mt-auto">
                                    <button class="btn btn-primary btn-sm d-block mx-auto" id="addToCartBtn" data-product-id="${product.id}" style="font-size: 0.8rem;">
                                        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    }

    // Function to load and display products
    function loadProducts() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const sort = sortSelect.value;
        const search = searchInput.value.trim() || urlParams.get('search') || '';

        // Build API URL with filters
        let apiUrl = '../php/filter.php?';
        if (category) {
            apiUrl += `category=${category}&`;
        }
        if (sort !== 'default') {
            apiUrl += `sort=${sort}&`;
        }
        if (search) {
            apiUrl += `search=${encodeURIComponent(search)}`;
            // Update search input if search param exists in URL
            searchInput.value = search;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(products => {
                // Update category title
                categoryTitle.textContent = category ?
                    category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1').trim() :
                    search ? `Kết quả tìm kiếm cho "${search}"` : 'Tất cả sản phẩm';

                // Filter out inactive products and render
                const activeProducts = products.filter(product => product.status === 'active');
                productGrid.innerHTML = activeProducts.length ?
                    activeProducts.map((product, index) => renderProduct(product, index)).join('') :
                    '<div class="col-12 text-center">Không tìm thấy sản phẩm nào.</div>';

                // Reinitialize AOS for new elements
                AOS.refresh();
            })
            .catch(error => {
                console.error('Error loading products:', error);
                productGrid.innerHTML = '<div class="col-12 text-center">Đã xảy ra lỗi khi tải sản phẩm.</div>';
            });
    }

    // Event listeners
    sortSelect.addEventListener('change', loadProducts);
    searchBtn.addEventListener('click', loadProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadProducts();
        }
    });

    // Initial load
    loadProducts();

    document.addEventListener('click', (e) => {
        // Handle clicking on product card
        if (e.target.closest('.product-card') && !e.target.closest('#addToCartBtn')) {
            const productId = e.target.closest('.product-card').querySelector('.btn-primary').dataset.productId;
            window.location.href = `chitietsanpham.html?id=${productId}`;
        }
        // Handle clicking on add to cart button
        if (e.target.closest('#addToCartBtn')) {
            e.preventDefault();
            e.stopPropagation();
            const productId = e.target.closest('#addToCartBtn').dataset.productId;
            fetch(`../php/giohang.php?id=${productId}`)
                .then(response => response.json())
                .then(data => {
                    // lấy thông báo từ server
                    const message = data.message;
                    if (toastr && toastr.success) {
                        toastr.success(message);
                    } else {
                        console.log('Success:', message);
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                    if (toastr && toastr.error) {
                        toastr.error('Có lỗi xảy ra, vui lòng thử lại');
                    } else {
                        console.log('Error:', 'Có lỗi xảy ra, vui lòng thử lại');
                    }
                });
        }
    });
});
