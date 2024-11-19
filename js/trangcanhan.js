// Create logout button
const logoutButton = document.createElement("a");
logoutButton.classList.add("btn", "btn-outline-secondary", "me-2");
logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
logoutButton.style.display = "none";

// Function to check login status and redirect if not logged in
function checkLoginStatus() {
  const sessionPath = window.location.pathname.includes("/include/")
    ? "../php/check_session.php"
    : "php/check_session.php";
    
  fetch(sessionPath)
    .then((response) => response.json())
    .then((data) => {
      console.log("Session data:", data);
      if (!data.loggedIn) {
        // Redirect to login page if not logged in
        window.location.href = window.location.pathname.includes("/include/")
          ? "dangnhap.html"
          : "include/dangnhap.html";
      } else {
        // Update UI for logged in user
        const userButton = document.querySelector(".user-actions .btn-outline-secondary");
        userButton.href = window.location.pathname.includes("/include/")
          ? "trangcanhan.html"
          : "include/trangcanhan.html";
        userButton.innerHTML = '<i class="far fa-user"></i>';
        
        // Show logout button
        logoutButton.style.display = "inline-block";
        userButton.parentNode.insertBefore(logoutButton, userButton.nextSibling);
        
        // Add logout handler
        logoutButton.addEventListener("click", function (e) {
          e.preventDefault();
          const logoutPath = window.location.pathname.includes("/include/")
            ? "../php/dangxuat.php"
            : "php/dangxuat.php";
          fetch(logoutPath)
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                window.location.href = window.location.pathname.includes("/include/")
                  ? "dangnhap.html"
                  : "include/dangnhap.html";
              }
            })
            .catch((error) => console.error("Error logging out:", error));
        });
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
}

// Check login status when page loads
document.addEventListener("DOMContentLoaded", checkLoginStatus);
document.addEventListener('DOMContentLoaded', () => {
    // Currency formatter
    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });

    // Date formatter
    const dateFormatter = new Intl.DateTimeFormat('vi-VN');

    // Status configurations
    const STATUS_CONFIG = {
        pending: {
            class: 'bg-warning',
            label: 'Chờ xử lý'
        },
        processing: {
            class: 'bg-info',
            label: 'Đang xử lý'
        },
        shipped: {
            class: 'bg-primary',
            label: 'Đang giao'
        },
        delivered: {
            class: 'bg-success',
            label: 'Đã giao'
        },
        cancelled: {
            class: 'bg-danger',
            label: 'Đã hủy'
        }
    };

    const getStatusBadge = status => {
        const config = STATUS_CONFIG[status];
        return config ? `<span class="badge ${config.class}">${config.label}</span>` : '';
    };

    const updateProfileForm = userData => {
        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;

        const formFields = {
            'text': 'full_name',
            'email': 'email',
            'tel': 'phone'
        };

        Object.entries(formFields).forEach(([type, field]) => {
            const input = profileForm.querySelector(`input[type="${type}"]`);
            if (input) input.value = userData[field] || '';
        });

        const addressTextarea = profileForm.querySelector('textarea');
        if (addressTextarea) addressTextarea.value = userData.address || '';
    };

    const updateSidebarInfo = userData => {
        const cardTitle = document.querySelector('.card-title');
        const textMuted = document.querySelector('.text-muted');

        if (cardTitle) cardTitle.textContent = userData.full_name || '';
        if (textMuted && userData.created_date) {
            textMuted.textContent = `Thành viên từ: ${dateFormatter.format(new Date(userData.created_date))}`;
        }
    };

    const loadUserProfile = async () => {
        try {
            const response = await fetch('../php/trangcanhan.php');
            if (!response.ok) throw new Error('Network response was not ok');

            const userData = await response.json();
            if (!userData) throw new Error('No user data found');

            if (userData.error) {
                if (['Not logged in', 'User not found'].includes(userData.error)) {
                    return;
                }
                throw new Error(userData.error);
            }

            updateProfileForm(userData);
            updateSidebarInfo(userData);

        } catch (error) {
            console.error('Error loading user profile:', error);
            window.location.href = 'dangnhap.html';
        }
    };

    const updateProfile = async (formData) => {
        try {
            // Get form values directly from the passed FormData
            const fullName = formData.get('full_name');
            const phone = formData.get('phone');
            const address = formData.get('address');

            // Validate empty fields
            if (!fullName?.trim()) {
                toastr.error('Vui lòng điền họ tên!');
                return;
            }
            if (!phone?.trim()) {
                toastr.error('Vui lòng điền số điện thoại!');
                return;
            }
            if (!address?.trim()) {
                toastr.error('Vui lòng điền địa chỉ!');
                return;
            }

            // Validate phone number format
            if (!/^[0-9]{10,11}$/.test(phone.trim())) {
                toastr.error('Số điện thoại không hợp lệ!');
                return;
            }

            // Validate full name length
            if (fullName.trim().length > 100) {
                toastr.error('Họ tên không được vượt quá 100 ký tự!');
                return;
            }

            console.log(formData);
            console.log(fullName, phone, address);
            const response = await fetch('../php/trangcanhan.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                toastr.success(result.message);
                loadUserProfile();
            } else {
                toastr.error(result.message);
            }


        } catch (error) {
            console.error('Error updating profile:', error);
            toastr.error('Lỗi cập nhật. Vui lòng thử lại!');
        }
    };

    // Handle form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            await updateProfile(formData);
        });
    }

    loadUserProfile();

    // Load orders
    const loadOrders = async () => {
        try {
            const response = await fetch('../php/donhang.php');
            const orders = await response.json();

            if (orders.error) {
                console.error(orders.error);
                return;
            }

            const tbody = document.querySelector('#orders table tbody');
            tbody.innerHTML = '';

            orders.forEach(order => {
                const row = `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.created_date).toLocaleDateString('vi-VN')}</td>
                    <td>${currencyFormatter.format(order.total_amount)}</td>
                    <td>${getStatusBadge(order.order_status)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="showOrderDetail(${JSON.stringify(order).replace(/"/g, '&quot;')})">
                            Chi tiết
                        </button>
                    </td>
                </tr>
            `;
                tbody.insertAdjacentHTML('beforeend', row);
            });

        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    // Show order detail in modal
    window.showOrderDetail = (order) => {
        const modal = document.getElementById('orderDetailModal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');

        modalTitle.textContent = `Chi tiết đơn hàng #${order.id}`;

        const statusText = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipped': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy'
        };

        const paymentMethodText = {
            'cod': 'Thanh toán khi nhận hàng',
            'bank_transfer': 'Chuyển khoản',
            'credit_card': 'Thẻ tín dụng'
        };

        const itemsHtml = order.items.map(item => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.featured_image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                    <span>${item.title}</span>
                </div>
            </td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-end">${currencyFormatter.format(item.price)}</td>
            <td class="text-end">${currencyFormatter.format(item.price * item.quantity)}</td>
        </tr>
    `).join('');

        modalBody.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">Thông tin giao hàng</h6>
                <p class="mb-2"><i class="bi bi-person me-2"></i>Người nhận: ${order.shipping_name || 'N/A'}</p>
                <p class="mb-2"><i class="bi bi-geo-alt me-2"></i>Địa chỉ: ${order.shipping_address || 'N/A'}</p>
                <p class="mb-2"><i class="bi bi-telephone me-2"></i>Số điện thoại: ${order.shipping_phone || 'N/A'}</p>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">Thông tin đơn hàng</h6>
                <p class="mb-2"><i class="bi bi-calendar me-2"></i>Ngày đặt: ${dateFormatter.format(new Date(order.created_date))}</p>
                <p class="mb-2"><i class="bi bi-info-circle me-2"></i>Trạng thái: ${statusText[order.order_status]}</p>
                <p class="mb-2"><i class="bi bi-credit-card me-2"></i>Phương thức thanh toán: ${paymentMethodText[order.payment_method]}</p>
                <p class="mb-2"><i class="bi bi-check-circle me-2"></i>Trạng thái thanh toán: ${order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th>Sản phẩm</th>
                        <th class="text-center" style="width: 100px">Số lượng</th>
                        <th class="text-end" style="width: 150px">Đơn giá</th>
                        <th class="text-end" style="width: 150px">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                        <td class="text-end fw-bold">${currencyFormatter.format(order.total_amount)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    };

    // Load orders when orders tab is shown
    document.querySelector('a[href="#orders"]').addEventListener('click', loadOrders);
});
