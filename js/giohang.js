// Load cart items on page load
document.addEventListener('DOMContentLoaded', function () {
    loadCartItems();

    // Add event listeners for quantity controls and remove buttons
    document.querySelector('.cart-items').addEventListener('click', function (e) {
        if (e.target.classList.contains('increase-qty')) {
            const productId = e.target.dataset.id;
            const cartId = e.target.dataset.cartId;
            const qtySpan = e.target.parentElement.querySelector('span');
            const priceElement = e.target.closest('.card-body').querySelector('.price');
            const maxQty = parseInt(e.target.closest('.cart-item').dataset.maxQuantity);
            const currentQty = parseInt(qtySpan.textContent);
            
            // Kiểm tra số lượng hiện tại với số lượng tồn kho
            if (currentQty >= maxQty) {
                
                if (typeof toastr !== 'undefined') {
                    toastr.warning('Số lượng đã đạt giới hạn tồn kho');
                } else {
                    alert('Số lượng đã đạt giới hạn tồn kho');
                }
                return;
            }
            updateQuantity(productId, cartId, 1, qtySpan, priceElement);
            
        } else if (e.target.classList.contains('decrease-qty')) {
            const productId = e.target.dataset.id;
            const cartId = e.target.dataset.cartId;
            const qtySpan = e.target.parentElement.querySelector('span');
            const priceElement = e.target.closest('.card-body').querySelector('.price');
            updateQuantity(productId, cartId, -1, qtySpan, priceElement);
        } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const removeBtn = e.target.closest('.remove-item');
            const productId = removeBtn.dataset.id;
            const cartId = removeBtn.dataset.cartId;
            const cartItem = removeBtn.closest('.cart-item');
            removeItem(productId, cartId, cartItem);
        }
    });

    var userData = {};
    fetch('../php/trangcanhan.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            // Get form inputs
            const nameInput = document.querySelector('#paymentForm input[type="text"]');
            const phoneInput = document.querySelector('#paymentForm input[type="tel"]'); 
            const addressInput = document.querySelector('#paymentForm textarea');
            
            if (nameInput) nameInput.value = data.full_name;
            if (phoneInput) phoneInput.value = data.phone;
            if (addressInput) addressInput.value = data.address;
            
            userData = data;
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    
    // xử lý khi click vào button thanh toán
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // nếu không có sản phẩm trong giỏ hàng thì không cho thanh toán
        if (document.querySelector('.cart-items').children.length === 0) {
            alert('Giỏ hàng không có sản phẩm nào!');
            return;
        }
        // Get form data
        const newName = document.querySelector('#paymentForm input[type="text"]').value;
        const newPhone = document.querySelector('#paymentForm input[type="tel"]').value;
        const newAddress = document.querySelector('#paymentForm textarea').value;

        // Compare with existing user data and update if different
        if (userData.full_name !== newName || 
            userData.phone !== newPhone || 
            userData.address !== newAddress) {
            
            const formData = new FormData();
            formData.append('full_name', newName);
            formData.append('phone', newPhone); 
            formData.append('address', newAddress);

            fetch('../php/trangcanhan.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userData.full_name = newName;
                    userData.phone = newPhone;
                    userData.address = newAddress;
                } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.error('Không thể cập nhật thông tin. Vui lòng thử lại!');
                    } else {
                        alert('Không thể cập nhật thông tin. Vui lòng thử lại!');
                    }
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Lỗi cập nhật thông tin!');
                } else {
                    alert('Lỗi cập nhật thông tin!');
                }
            });
        }
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        // Validate payment method
        if (!['cod', 'bank_transfer', 'credit_card'].includes(paymentMethod)) {
            if (typeof toastr !== 'undefined') {
                toastr.error('Phương thức thanh toán không hợp lệ!');
            } else {
                alert('Phương thức thanh toán không hợp lệ!');
            }
            return;
        }

        // Get cart items and create order
        fetch('../php/giohang.php')
            .then(response => response.json())
            .then(cartItems => {
                if (!Array.isArray(cartItems)) {
                    throw new Error('Error loading cart');
                }

                // Calculate total amount
                const totalAmount = cartItems.reduce((total, item) => {
                    const price = item.sale_price || item.price;
                    return total + (price * item.quantity);
                }, 0);

                // Create order data
                const orderData = {
                    shipping_name: newName,
                    shipping_phone: newPhone,
                    shipping_address: newAddress,
                    payment_method: paymentMethod,
                    payment_status: 'pending',
                    total_amount: totalAmount
                };

                // Send order to server
                return fetch('../php/giohang.php?action=create_order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                    modal.hide();
                    
                    // Show success message
                    if (typeof toastr !== 'undefined') {
                        toastr.success('Đặt hàng thành công!');
                    } else {
                        alert('Đặt hàng thành công!');
                    }
                    
                    // Update user profile if needed
                    const formData = new FormData();
                    formData.append('full_name', newName);
                    formData.append('phone', newPhone);
                    formData.append('address', newAddress);

                    return fetch('../php/trangcanhan.php', {
                        method: 'POST',
                        body: formData
                    });
                } else {
                    throw new Error(data.message || 'Error creating order');
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload cart after successful order and profile update
                    loadCartItems();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Đã có lỗi xảy ra. Vui lòng thử lại!');
                } else {
                    alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
                }
            });
    });
});

function loadCartItems() {
    fetch('../php/giohang.php')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error(data.message || 'Error loading cart');
            }

            const cartItemsContainer = document.querySelector('.cart-items');
            let subtotal = 0;

            // Clear existing items
            cartItemsContainer.innerHTML = '';

            data.forEach(item => {
                const price = item.sale_price || item.price;
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;

                // Kiểm tra stock_quantity có tồn tại không
                const stockQuantity = item.stock_quantity || 0;
                console.log('Stock quantity for product', item.product_id, ':', stockQuantity);

                const itemHtml = `
                    <div class="cart-item card mb-3" data-max-quantity="${stockQuantity}">
                        <div class="row g-0">
                            <div class="col-md-2">
                                <img src="${item.featured_image}" class="img-fluid rounded-start" alt="${item.title}">
                            </div>
                            <div class="col-md-10">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <h5 class="card-title">${item.title}</h5>
                                        <button class="btn btn-sm btn-danger remove-item" data-id="${item.product_id}" data-cart-id="${item.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center mt-3">
                                        <div class="quantity-controls">
                                            <button class="btn btn-sm btn-outline-secondary decrease-qty" data-id="${item.product_id}" data-cart-id="${item.id}">-</button>
                                            <span class="mx-2">${item.quantity}</span>
                                            <button class="btn btn-sm btn-outline-secondary increase-qty" data-id="${item.product_id}" data-cart-id="${item.id}">+</button>
                                        </div>
                                        <div class="price" data-unit-price="${price}">
                                            ${itemTotal.toLocaleString('vi-VN')} VNĐ
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHtml;
            });

            updateCartSummary(subtotal);
        })
        .catch(error => {
            console.error('Error:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message);
            } else {
                alert(error.message);
            }
        });
}

function updateCartSummary(subtotal) {
    document.querySelector('.subtotal').textContent = `${subtotal.toLocaleString('vi-VN')} VNĐ`;
    // const shipping = 30000;
    const total = subtotal;
    document.querySelector('.total').textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
}

function updateQuantity(productId, cartId, change, qtySpan, priceElement) {
    const currentQty = parseInt(qtySpan.textContent);
    const newQty = currentQty + change;
    const unitPrice = parseFloat(priceElement.dataset.unitPrice);

    // Show confirmation if quantity will become 0
    if (newQty <= 0) {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }
    }

    fetch(`../php/giohang.php?action=update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            cart_id: cartId,
            change: change
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (newQty <= 0) {
                    // Remove item if quantity becomes 0
                    qtySpan.closest('.cart-item').remove();
                } else {
                    qtySpan.textContent = newQty;

                    // Update price display with new total
                    const newTotal = unitPrice * newQty;
                    priceElement.textContent = `${newTotal.toLocaleString('vi-VN')} VNĐ`;
                }

                // Recalculate cart total
                let newSubtotal = 0;
                document.querySelectorAll('.cart-item').forEach(item => {
                    const qty = parseInt(item.querySelector('.quantity-controls span').textContent);
                    const price = parseFloat(item.querySelector('.price').dataset.unitPrice);
                    newSubtotal += qty * price;
                });

                updateCartSummary(newSubtotal);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message);
            } else {
                alert(error.message);
            }
        });
}

function removeItem(productId, cartId, cartItem) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        fetch(`../php/giohang.php?action=remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                cart_id: cartId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove item locally
                    cartItem.remove();

                    // Recalculate cart total
                    let newSubtotal = 0;
                    document.querySelectorAll('.cart-item').forEach(item => {
                        const qty = parseInt(item.querySelector('.quantity-controls span').textContent);
                        const price = parseFloat(item.querySelector('.price').dataset.unitPrice);
                        newSubtotal += qty * price;
                    });

                    updateCartSummary(newSubtotal);
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error(error.message);
                } else {
                    alert(error.message);
                }
            });
    }
}
