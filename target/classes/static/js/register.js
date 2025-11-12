// 注册页面功能
document.addEventListener('DOMContentLoaded', function() {
    setupRegisterForm();
    setupPasswordToggle();
    setupRealTimeValidation();
    
    // 如果已经登录，跳转到首页
    if (app.currentUser()) {
        window.location.href = 'index.html';
    }
});

// 设置注册表单
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    const registerButton = document.getElementById('registerButton');
    
    if (!form || !registerButton) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateRegisterForm()) {
            return;
        }
        
        const formData = new FormData(form);
        const registerData = {
            username: formData.get('username').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            realName: formData.get('realName').trim(),
            phone: formData.get('phone').trim()
        };
        
        // 显示加载状态
        app.showLoading(registerButton, '注册中...');
        
        // 执行注册
        app.register(registerData)
            .then(data => {
                app.showMessage('注册成功！请登录', 'success');
                
                // 跳转到登录页面
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            })
            .catch(error => {
                app.showMessage(error.message || '注册失败，请重试', 'danger');
            })
            .finally(() => {
                app.hideLoading(registerButton, '<i class="fas fa-user-plus me-2"></i>注册');
            });
    });
}

// 验证注册表单
function validateRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return false;
    
    // 基本验证
    if (!app.validateForm(form)) {
        return false;
    }
    
    // 密码确认验证
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        confirmPasswordInput.classList.add('is-invalid');
        confirmPasswordInput.classList.remove('is-valid');
        return false;
    } else {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        confirmPasswordInput.classList.remove('is-invalid');
        confirmPasswordInput.classList.add('is-valid');
    }
    
    // 协议同意验证
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        agreeTerms.classList.add('is-invalid');
        return false;
    } else {
        agreeTerms.classList.remove('is-invalid');
    }
    
    return true;
}

// 设置密码显示/隐藏切换
function setupPasswordToggle() {
    const toggleButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (!toggleButton || !passwordInput) return;
    
    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = toggleButton.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

// 设置实时验证
function setupRealTimeValidation() {
    // 用户名验证
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const username = this.value.trim();
            if (username.length >= 3 && username.length <= 20) {
                checkUsernameAvailability(username);
            }
        });
    }
    
    // 邮箱验证
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && isValidEmail(email)) {
                checkEmailAvailability(email);
            }
        });
    }
    
    // 密码确认验证
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (confirmPassword && password === confirmPassword) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
}

// 检查用户名可用性
function checkUsernameAvailability(username) {
    const usernameInput = document.getElementById('username');
    if (!usernameInput) return;
    
    app.checkUsername(username)
        .then(available => {
            if (available) {
                usernameInput.classList.remove('is-invalid');
                usernameInput.classList.add('is-valid');
            } else {
                usernameInput.classList.remove('is-valid');
                usernameInput.classList.add('is-invalid');
                usernameInput.setCustomValidity('用户名已存在');
            }
        })
        .catch(error => {
            console.error('检查用户名失败:', error);
        });
}

// 检查邮箱可用性
function checkEmailAvailability(email) {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    app.checkEmail(email)
        .then(available => {
            if (available) {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
            } else {
                emailInput.classList.remove('is-valid');
                emailInput.classList.add('is-invalid');
                emailInput.setCustomValidity('邮箱已被注册');
            }
        })
        .catch(error => {
            console.error('检查邮箱失败:', error);
        });
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
