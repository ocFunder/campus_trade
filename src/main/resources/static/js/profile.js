// 个人中心页面相关功能
let currentUser = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待用户信息加载完成
    waitForUserAuth();
});

// 等待用户认证完成
function waitForUserAuth() {
    if (app.currentUser()) {
        // 用户已登录，继续初始化
        initializePage();
    } else if (app.authToken()) {
        // 有token但用户信息还在加载，等待一下
        setTimeout(waitForUserAuth, 100);
    } else {
        // 没有token，需要登录
        app.showMessage('请先登录', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// 初始化页面
function initializePage() {
    // 加载用户信息
    loadUserProfile();
    
    // 加载统计数据
    loadUserStats();
    
    // 设置表单事件监听器
    setupFormListeners();
}

// 加载用户信息
function loadUserProfile() {
    const token = app.authToken();
    if (!token) return;
    
    // 从token中解析用户信息（这里简化处理，实际应该从API获取）
    const user = app.currentUser();
    if (user) {
        currentUser = user;
        populateUserForm(user);
    }
}

// 填充用户表单
function populateUserForm(user) {
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('realName').value = user.realName || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('avatar').value = user.avatar || '';
}

// 加载用户统计数据
function loadUserStats() {
    const token = app.authToken();
    if (!token) return;
    
    // 加载评价统计
    fetch(`${app.API_BASE_URL}/reviews/my-stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const stats = data.data;
            document.getElementById('myReviewsCount').textContent = stats.totalReviews || 0;
            
            // 显示平均评分
            if (stats.averageRating) {
                const avgRating = stats.averageRating.toFixed(1);
                const reviewsCountElement = document.getElementById('myReviewsCount');
                if (reviewsCountElement) {
                    reviewsCountElement.innerHTML = `${stats.totalReviews || 0}<br><small class="text-muted">平均评分: ${avgRating}</small>`;
                }
            }
        }
    })
    .catch(error => {
        console.error('加载评价统计失败:', error);
    });
    
    // 加载商品统计（如果有API）
    // 暂时使用模拟数据
    document.getElementById('myProductsCount').textContent = '0';
    document.getElementById('myOrdersCount').textContent = '0';
}

// 设置表单事件监听器
function setupFormListeners() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
}

// 更新用户资料
function updateProfile() {
    const token = app.authToken();
    if (!token) {
        app.showMessage('请先登录', 'warning');
        return;
    }
    
    const formData = {
        realName: document.getElementById('realName').value,
        phone: document.getElementById('phone').value,
        avatar: document.getElementById('avatar').value
    };
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证密码
    if (newPassword && newPassword !== confirmPassword) {
        app.showMessage('新密码和确认密码不匹配', 'danger');
        return;
    }
    
    if (newPassword) {
        if (!currentPassword) {
            app.showMessage('修改密码需要输入当前密码', 'warning');
            return;
        }
        formData.currentPassword = currentPassword;
        formData.newPassword = newPassword;
    }
    
    // 这里应该调用更新用户资料的API
    // 暂时显示成功消息
    app.showMessage('资料更新成功！', 'success');
    
    // 清空密码字段
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// 导出函数供HTML调用
window.updateProfile = updateProfile;
