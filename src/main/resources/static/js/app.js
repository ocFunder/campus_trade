// 全局应用配置
const API_BASE_URL = '/api';

// 全局变量
let currentUser = null;
let authToken = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 检查用户登录状态
    checkAuthStatus();
    
    // 设置全局事件监听器
    setupGlobalEventListeners();
}

// 检查用户认证状态
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        // 验证token有效性
        fetchCurrentUser();
    } else {
        showGuestNavigation();
    }
}

// 获取当前用户信息
function fetchCurrentUser() {
    fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = data.data;
            showUserNavigation();
        } else {
            // Token无效，清除本地存储
            clearAuthData();
            showGuestNavigation();
        }
    })
    .catch(error => {
        console.error('获取用户信息失败:', error);
        clearAuthData();
        showGuestNavigation();
    });
}

// 显示用户导航
function showUserNavigation() {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const userNav = document.getElementById('userNav');
    const username = document.getElementById('username');
    const adminNav = document.getElementById('adminNav');
    
    if (loginNav) loginNav.style.display = 'none';
    if (registerNav) registerNav.style.display = 'none';
    if (userNav) {
        userNav.style.display = 'block';
        if (username && currentUser) {
            username.textContent = currentUser.username;
        }
    }
    
    // 如果是管理员，显示后台管理链接
    if (adminNav && currentUser && currentUser.role === 'ADMIN') {
        adminNav.style.display = 'block';
    } else if (adminNav) {
        adminNav.style.display = 'none';
    }
}

// 显示访客导航
function showGuestNavigation() {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const userNav = document.getElementById('userNav');
    
    if (loginNav) loginNav.style.display = 'block';
    if (registerNav) registerNav.style.display = 'block';
    if (userNav) userNav.style.display = 'none';
}

// 清除认证数据
function clearAuthData() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
}

// 用户登录
function login(usernameOrEmail, password) {
    return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usernameOrEmail: usernameOrEmail,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            authToken = data.data.accessToken;
            currentUser = {
                id: data.data.userId,
                username: data.data.username,
                role: data.data.role
            };
            localStorage.setItem('authToken', authToken);
            showUserNavigation();
            return data;
        } else {
            throw new Error(data.message);
        }
    });
}

// 用户注册
function register(userData) {
    return fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data;
        } else {
            throw new Error(data.message);
        }
    });
}

// 格式化日期时间
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 格式化价格
function formatPrice(price) {
    if (!price) return '¥0.00';
    return `¥${parseFloat(price).toFixed(2)}`;
}

// 显示成功提示
function showSuccessToast(message) {
    showMessage(message, 'success');
}

// 显示错误提示
function showErrorToast(message) {
    showMessage(message, 'error');
}

// 显示警告提示
function showWarningToast(message) {
    showMessage(message, 'warning');
}

// 显示信息提示
function showInfoToast(message) {
    showMessage(message, 'info');
}

// 获取用户角色文本
function getUserRoleText(role) {
    switch (role) {
        case 'USER': return '普通用户';
        case 'MODERATOR': return '版主';
        case 'ADMIN': return '管理员';
        default: return '未知';
    }
}

// 获取用户状态文本
function getUserStatusText(status) {
    switch (status) {
        case 'ACTIVE': return '活跃';
        case 'INACTIVE': return '非活跃';
        case 'DELETED': return '已删除';
        default: return '未知';
    }
}

// 获取用户状态样式类
function getUserStatusClass(status) {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'warning';
        case 'DELETED': return 'danger';
        default: return 'secondary';
    }
}

// 获取用户角色样式类
function getRoleBadgeClass(role) {
    switch (role) {
        case 'ADMIN': return 'danger';
        case 'MODERATOR': return 'warning';
        case 'USER': return 'primary';
        default: return 'secondary';
    }
}

// 获取商品分类文本
function getProductCategoryText(category) {
    switch (category) {
        case 'ELECTRONICS': return '电子产品';
        case 'BOOKS': return '图书教材';
        case 'CLOTHING': return '服装配饰';
        case 'SPORTS': return '运动用品';
        case 'DAILY': return '生活用品';
        case 'STUDY': return '学习用品';
        default: return '其他';
    }
}

// 获取商品状态文本
function getProductStatusText(status) {
    switch (status) {
        case 'ACTIVE': return '活跃';
        case 'SOLD': return '已售出';
        case 'DELETED': return '已删除';
        default: return '未知';
    }
}

// 获取商品状态样式类
function getProductStatusClass(status) {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'SOLD': return 'info';
        case 'DELETED': return 'danger';
        default: return 'secondary';
    }
}

// 获取订单状态文本
function getOrderStatusText(status) {
    switch (status) {
        case 'PENDING': return '待支付';
        case 'PAID': return '已支付';
        case 'SHIPPED': return '已发货';
        case 'COMPLETED': return '已完成';
        case 'CANCELLED': return '已取消';
        default: return '未知';
    }
}

// 获取订单状态样式类
function getOrderStatusClass(status) {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'PAID': return 'info';
        case 'SHIPPED': return 'primary';
        case 'COMPLETED': return 'success';
        case 'CANCELLED': return 'danger';
        default: return 'secondary';
    }
}

// 处理API响应
function handleApiResponse(response) {
    return response.json().then(data => {
        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }
        return data;
    });
}

// 等待用户认证完成
function waitForUserAuth() {
    return new Promise((resolve, reject) => {
        if (currentUser) {
            resolve(currentUser);
        } else {
            // 等待最多5秒
            let attempts = 0;
            const checkUser = () => {
                if (currentUser) {
                    resolve(currentUser);
                } else if (attempts < 50) { // 5秒 = 50 * 100ms
                    attempts++;
                    setTimeout(checkUser, 100);
                } else {
                    reject(new Error('用户认证超时'));
                }
            };
            checkUser();
        }
    });
}

// 用户登出
function logout() {
    clearAuthData();
    showGuestNavigation();
    showMessage('已退出登录', 'success');
    
    // 如果当前页面需要登录，跳转到相应页面
    if (window.location.pathname.includes('admin')) {
        window.location.href = 'login.html';
    } else if (window.location.pathname.includes('profile') || 
        window.location.pathname.includes('my-')) {
        window.location.href = 'index.html';
    }
}

// 检查用户名是否可用
function checkUsername(username) {
    return fetch(`${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => data.data);
}

// 检查邮箱是否可用
function checkEmail(email) {
    return fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => data.data);
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 创建提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 添加到页面
    document.body.appendChild(alertDiv);
    
    // 自动移除
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// 显示加载状态
function showLoading(element, text = '加载中...') {
    if (element) {
        element.innerHTML = `<div class="loading"></div> ${text}`;
        element.disabled = true;
    }
}

// 隐藏加载状态
function hideLoading(element, originalText = '') {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

// 格式化价格
function formatPrice(price) {
    return `¥${parseFloat(price).toFixed(2)}`;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化相对时间
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return formatDate(dateString);
}

// 截断文本
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 验证表单
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// 清除表单验证状态
function clearFormValidation(formElement) {
    const inputs = formElement.querySelectorAll('.is-invalid');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
    });
}

// 设置全局事件监听器
function setupGlobalEventListeners() {
    // 处理表单提交
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.classList.contains('needs-validation')) {
            e.preventDefault();
            e.stopPropagation();
            
            if (validateForm(form)) {
                // 表单验证通过，可以提交
                form.classList.add('was-validated');
            } else {
                form.classList.add('was-validated');
            }
        }
    });
    
    // 处理输入框实时验证
    document.addEventListener('input', function(e) {
        if (e.target.hasAttribute('required')) {
            if (e.target.value.trim()) {
                e.target.classList.remove('is-invalid');
                e.target.classList.add('is-valid');
            } else {
                e.target.classList.remove('is-valid');
                e.target.classList.add('is-invalid');
            }
        }
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 获取URL参数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 设置URL参数
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

// 移除URL参数
function removeUrlParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
}

// 检查用户权限
function hasPermission(requiredRole) {
    if (!currentUser) return false;
    
    const roleHierarchy = {
        'USER': 1,
        'MODERATOR': 2,
        'ADMIN': 3
    };
    
    const userLevel = roleHierarchy[currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
}

// 需要登录的页面检查
function requireAuth() {
    if (!currentUser) {
        showMessage('请先登录', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

// 需要管理员权限的页面检查
function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!hasPermission('ADMIN')) {
        showMessage('权限不足', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return false;
    }
    return true;
}

// 导出全局函数
window.app = {
    login,
    register,
    logout,
    checkUsername,
    checkEmail,
    showMessage,
    showLoading,
    hideLoading,
    formatPrice,
    formatDate,
    formatRelativeTime,
    truncateText,
    validateForm,
    clearFormValidation,
    debounce,
    throttle,
    getUrlParameter,
    setUrlParameter,
    removeUrlParameter,
    hasPermission,
    requireAuth,
    requireAdmin,
    API_BASE_URL,
    currentUser: () => currentUser,
    authToken: () => authToken
};
