document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember');

  // Kiểm tra nếu có thông tin đăng nhập được lưu trước đó
  if (localStorage.getItem('rememberedEmail')) {
    emailInput.value = localStorage.getItem('rememberedEmail');
    passwordInput.value = localStorage.getItem('rememberedPassword');
    rememberCheckbox.checked = true;
  }

  // Hàm hiển thị lỗi
  function showError(input, message) {
    const formGroup = input.closest('.mb-3');
    const errorDiv = formGroup.querySelector('.error-message') || document.createElement('div');
    errorDiv.className = 'error-message text-danger mt-1';
    errorDiv.textContent = message;
    if (!formGroup.querySelector('.error-message')) {
      formGroup.appendChild(errorDiv);
    }
    input.classList.add('is-invalid');
  }

  // Hàm xóa lỗi
  function clearError(input) {
    const formGroup = input.closest('.mb-3');
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove('is-invalid');
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Xóa tất cả thông báo lỗi cũ
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate email
    if (!email) {
      showError(emailInput, 'Vui lòng nhập email');
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showError(emailInput, 'Email không hợp lệ');
      emailInput.focus();
      return;
    }

    // Validate password
    if (!password) {
      showError(passwordInput, 'Vui lòng nhập mật khẩu');
      passwordInput.focus();
      return;
    }

    if (password.length < 6) {
      showError(passwordInput, 'Mật khẩu phải có ít nhất 6 ký tự');
      passwordInput.focus();
      return;
    }

    // Gửi request đăng nhập đến server
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('remember', rememberCheckbox.checked);

    fetch('../php/dangnhap.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Lưu thông tin đăng nhập nếu checkbox được chọn
        if (rememberCheckbox.checked) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }

        // Chuyển hướng dựa vào role
        if (data.role === 'admin') {
          window.location.href = '../admin/index.html';
        } else {
          window.location.href = '../index.html';
        }
      } else {
        // Hiển thị lỗi từ server
        if (data.message.includes('Email')) {
          showError(emailInput, data.message);
          emailInput.focus();
        } else if (data.message.includes('Mật khẩu')) {
          showError(passwordInput, data.message);
          passwordInput.focus();
        } else {
          showError(emailInput, data.message);
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showError(emailInput, 'Có lỗi xảy ra, vui lòng thử lại sau');
    });
  });

  // Xóa lỗi khi người dùng bắt đầu nhập
  emailInput.addEventListener('input', () => clearError(emailInput));
  passwordInput.addEventListener('input', () => clearError(passwordInput));

  // Hàm kiểm tra email hợp lệ
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
