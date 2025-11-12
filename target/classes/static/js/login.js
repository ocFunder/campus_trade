// 登录页面功能
document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
    setupPasswordToggle();
    
    // 如果已经登录，跳转到首页
    if (app.currentUser()) {
        window.location.href = 'index.html';
    }
});

// 设置登录表单
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    
    if (!form || !loginButton) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!app.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const loginData = {
            usernameOrEmail: formData.get('usernameOrEmail').trim(),
            password: formData.get('password')
        };
        
        // 显示加载状态
        app.showLoading(loginButton, '登录中...');
        
        // 执行登录
        app.login(loginData.usernameOrEmail, loginData.password)
            .then(data => {
                app.showMessage('登录成功！', 'success');
                
                // 跳转到首页或之前访问的页面
                const redirectUrl = app.getUrlParameter('redirect') || 'index.html';
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            })
            .catch(error => {
                app.showMessage(error.message || '登录失败，请检查用户名和密码', 'danger');
            })
            .finally(() => {
                app.hideLoading(loginButton, '<i class="fas fa-sign-in-alt me-2"></i>登录');
            });
    });
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
