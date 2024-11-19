document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        AOS.init();
        $('#bannerCarousel').carousel({
            interval: 5000,
            pause: 'hover'
        });

        $('.carousel-item').on('slide.bs.carousel', function () {
            $(this).find('.animate__animated').removeClass('animate__fadeInDown animate__fadeInUp').addClass('animate__fadeOut');
        });

        $('.carousel-item').on('slid.bs.carousel', function () {
            $(this).find('.animate__animated').removeClass('animate__fadeOut').addClass('animate__fadeInDown animate__fadeInUp');
        });
    });

    function removeVietnameseTones(str) {
        // Chuyển đổi các ký tự có dấu thành ký tự không dấu
        return str
            .normalize('NFD') // Chuẩn hóa chuỗi để tách dấu ra khỏi ký tự
            .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu
            .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Thay thế chữ đ/Đ
            .replace(/[^a-zA-Z0-9 ]/g, '') // Loại bỏ các ký tự đặc biệt
            .replace(/\s+/g, ''); // Loại bỏ khoảng trắng
    }
    
    function loadCategories() {
        // Fix path for categories API when in subdirectory
        const categoriesPath = window.location.pathname.includes('/include/') ? '../php/danhmuc.php' : 'php/danhmuc.php';
    
        fetch(categoriesPath)
            .then(response => response.json())
            .then(categories => {
                // Get dropdown menu element
                const dropdownMenu = document.querySelector('.dropdown-menu');
                
                // Clear existing items
                dropdownMenu.innerHTML = '';
                
                // Add each category as a dropdown item
                categories.forEach(category => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.classList.add('dropdown-item');
                    
                    // Sử dụng hàm chuyển đổi để loại bỏ dấu khỏi category name
                    const categorySlug = removeVietnameseTones(category.category_name.toLowerCase());
                    
                    a.href = window.location.pathname.includes('/include/') ? 
                        `sanpham.html?category=${categorySlug}` :
                        `include/sanpham.html?category=${categorySlug}`;
                    
                    a.textContent = category.category_name;
                    li.appendChild(a);
                    dropdownMenu.appendChild(li);
                });
            })
            .catch(error => console.error('Error loading categories:', error));
    }
    

    // Load categories when page loads
    loadCategories();
    // Get reference to user actions container and user button
    const userActions = document.querySelector('.user-actions');
    const userButton = userActions.querySelector('a[href*="dangnhap"]');

    // Create logout button
    const logoutButton = document.createElement('a');
    logoutButton.classList.add('btn', 'btn-outline-secondary', 'me-2');
    logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    logoutButton.style.display = 'none';

    // Insert logout button after user button
    userButton.parentNode.insertBefore(logoutButton, userButton.nextSibling);

    // Add logout handler
    logoutButton.addEventListener('click', function (e) {
        e.preventDefault();
        // Fix path for logout API when in subdirectory
        const logoutPath = window.location.pathname.includes('/include/') ? '../php/dangxuat.php' : 'php/dangxuat.php';
        fetch(logoutPath)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                }
            })
            .catch(error => console.error('Error logging out:', error));
    });

    // Function to check login status
    function checkLoginStatus() {
        // Fix path for session check API when in subdirectory
        const sessionPath = window.location.pathname.includes('/include/') ? '../php/check_session.php' : 'php/check_session.php';
        fetch(sessionPath)
            .then(response => response.json())
            .then(data => {
                console.log('Session data:', data);
                if (data.loggedIn) {
                    // User is logged in
                    userButton.href = window.location.pathname.includes('/include/') ? 'trangcanhan.html' : 'include/trangcanhan.html';
                    userButton.innerHTML = '<i class="far fa-user"></i>';
                    logoutButton.style.display = 'inline-block';
                } else {
                    // User is not logged in
                    userButton.href = window.location.pathname.includes('/include/') ? 'dangnhap.html' : 'include/dangnhap.html';
                    userButton.innerHTML = '<i class="far fa-user"></i>';
                    logoutButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error checking login status:', error);
            });
    }

    // Check initially on page load
    checkLoginStatus();

    // Check periodically every 5 seconds
    // setInterval(checkLoginStatus, 5000);

    // Fetch products
    // Fix path for products API when in subdirectory
    const productsPath = window.location.pathname.includes('/include/') ? '../php/san_pham_view.php' : 'php/san_pham_view.php';
    fetch(productsPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const productsContainer = document.querySelector('.new-products .row');
            if (!productsContainer) return;

            // Clear any existing product cards
            productsContainer.innerHTML = '';

            // Show only first 8 products
            const productsToShow = data.slice(0, 8);

            // Add product cards from database
            productsToShow.forEach((product, index) => {
                const productCard = `
                    <div class="col-md-3 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="card product-card h-100">
                            <div class="position-relative">
                                <img src="${product.featured_image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;" />
                                ${product.stock_quantity < 10 && product.stock_quantity > 0 ?
                                    `<span class="badge bg-warning position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">Sắp hết</span>` :
                                product.stock_quantity === 0 ?
                                    `<span class="badge bg-secondary position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">Hết hàng</span>` :
                                product.sale_price > 0 ?
                                    `<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="font-size: 0.8rem;">-${Math.round((1 - product.sale_price/product.price) * 100)}%</span>` :
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
                productsContainer.insertAdjacentHTML('beforeend', productCard);
            });

            // Add view more button if there are more than 8 products
            if (data.length > 8) {
                const viewMoreButton = `
                    <div class="col-12 text-center mt-4">
                        <button class="btn btn-outline-primary" id="viewMoreBtn">Xem thêm</button>
                    </div>
                `;
                productsContainer.insertAdjacentHTML('beforeend', viewMoreButton);

                // Add click handler for view more button
                document.getElementById('viewMoreBtn').addEventListener('click', () => {
                    window.location.href = window.location.pathname.includes('/include/') ? 'sanpham.html' : 'include/sanpham.html';
                });
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            const productsContainer = document.querySelector('.new-products .row');
            if (productsContainer) {
                productsContainer.innerHTML = '<div class="col-12 text-center">Error loading products. Please try again later.</div>';
            }
        });

    // Add click handlers for product actions
    document.addEventListener('click', (e) => {
        // Handle clicking on product card
        if (e.target.closest('.product-card') && !e.target.closest('#addToCartBtn')) {
            const productId = e.target.closest('.product-card').querySelector('.btn-primary').dataset.productId;
            window.location.href = window.location.pathname.includes('/include/') ? `chitietsanpham.html?id=${productId}` : `include/chitietsanpham.html?id=${productId}`;
        }
        // Handle clicking on add to cart button
        if (e.target.closest('#addToCartBtn')) {
            e.preventDefault();
            e.stopPropagation();
            const productId = e.target.closest('#addToCartBtn').dataset.productId;
            const cartPath = window.location.pathname.includes('/include/') ? '../php/giohang.php' : 'php/giohang.php';
            fetch(`${cartPath}?id=${productId}`)
                .then(response => response.json())
                .then(data => {
                    // lấy thông báo từ server
                    const message = data.message;
                    toastr.success(message);
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                    toastr.error('Có lỗi xảy ra, vui lòng thử lại');
                });
        }
    });
});
