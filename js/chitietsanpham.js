document.addEventListener('DOMContentLoaded', function () {
    // Initialize AOS
    AOS.init();
    // Wait for jQuery to be loaded
    if (typeof jQuery !== 'undefined') {
        initializeProductPage();
    } else {
        // If jQuery isn't loaded yet, wait a bit and try again
        setTimeout(function() {
            if (typeof jQuery !== 'undefined') {
                initializeProductPage();
            } else {
                console.error('jQuery is not loaded');
            }
        }, 500);
    }
    // Kiểm tra số lượng không vượt quá tồn kho khi thay đổi
    let inputQuantity = $("#quantity");
    inputQuantity.on('change', function() {
        const quantity = parseInt($(this).val());
        // Get product data from the page
        const product = window.productData;
        if (quantity > product.stock_quantity) {
            toastr.error('Số lượng vượt quá số lượng trong kho');
            $(this).val(product.stock_quantity);
        }
    });
    // Add event listener for the add to cart button
    $("#addToCart").click((e) => {
        e.preventDefault();
        const quantity = parseInt($("#quantity").val());
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");
        
        // kiểm tra số lượng
        if (quantity <= 0) {
            toastr.error('Số lượng phải lớn hơn 0');
            return;
        }
        
        fetch(`../php/giohang.php?id=${productId}&quantity=${quantity}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Initialize toastr options
                    toastr.options = {
                        "closeButton": true,
                        "progressBar": true,
                        "positionClass": "toast-top-right",
                        "timeOut": "3000"
                    };
                    
                    toastr.success(data.message + ' Đang chuyển hướng đến giỏ hàng');
                    setTimeout(() => {
                        window.location.href = 'giohang.html';
                    }, 2000);
                    // Update cart badge
                    const cartBadge = document.querySelector('.badge');
                    const currentCount = parseInt(cartBadge.textContent);
                    cartBadge.textContent = currentCount + quantity;
                } else {
                    toastr.options = {
                        "closeButton": true,
                        "progressBar": true,
                        "positionClass": "toast-top-right",
                        "timeOut": "3000"
                    };
                    
                    toastr.error(data.message);
                }
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                toastr.options = {
                    "closeButton": true,
                    "progressBar": true,
                    "positionClass": "toast-top-right", 
                    "timeOut": "3000"
                };
                
                toastr.error('Có lỗi xảy ra, vui lòng thử lại');
            });
    });

});

function initializeProductPage() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // Fetch product details
    fetch(`../php/chitietsanpham.php?id=${productId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const product = data.data;
                // Store product data globally
                window.productData = product;

                // Update product title
                $(".product-title").text(product.title);

                // Update prices
                if (product.sale_price > 0) {
                    $(".sale-price").text(
                        `${parseInt(product.sale_price).toLocaleString()} VNĐ`
                    );
                    $(".original-price").text(
                        `${parseInt(product.price).toLocaleString()} VNĐ`
                    );
                } else {
                    $(".original-price").hide();
                    $(".sale-price").text(
                        `${parseInt(product.price).toLocaleString()} VNĐ`
                    );
                }

                // Update stock status
                $(".stock-text").text(
                    product.stock_quantity > 0 ? "Còn hàng" : "Hết hàng"
                );

                // Update description
                $(".description-text").text(product.description);

                // Update categories
                $(".category-list").text(product.categories.join(", "));

                // Update tags
                $(".tag-list").text(product.tags.join(", "));

                // Update main image
                $(".main-image a").attr("href", product.featured_image);
                $(".main-image img").attr({
                    "src": product.featured_image,
                    "alt": product.title
                });

                // Update thumbnails
                let thumbnailsHtml = '';
                if (product.gallery_images && product.gallery_images.length > 0) {
                    thumbnailsHtml = product.gallery_images.map(image => `
                        <div class="col-3">
                            <a href="${image}" data-lightbox="product-gallery">
                                <img src="${image}" alt="${product.title}" class="img-fluid rounded" style="height: 80px; object-fit: cover;">
                            </a>
                        </div>
                    `).join('');
                }
                $(".thumbnails .row").html(thumbnailsHtml);

                // Quantity controls
                $("#decreaseQuantity").click(() => {
                    const input = $("#quantity");
                    const value = parseInt(input.val());
                    if (value > 1) input.val(value - 1);
                });

                $("#increaseQuantity").click(() => {
                    const input = $("#quantity");
                    const currentValue = parseInt(input.val());
                    if (currentValue < product.stock_quantity) {
                        input.val(currentValue + 1);
                    } else {
                        toastr.warning('Số lượng đã đạt giới hạn tồn kho');
                    }
                });

                // Set max attribute for quantity input
                $("#quantity").attr('max', product.stock_quantity);
            }
        })
        .catch((error) => console.error("Error:", error));
}
