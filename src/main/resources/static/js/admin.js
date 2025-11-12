// 后台管理JavaScript逻辑
let adminCurrentUser = null;
let currentPage = {
    users: 0,
    products: 0,
    orders: 0
};

// 确保函数在全局作用域中可用
window.showDashboard = showDashboard;
window.showUsers = showUsers;
window.showProducts = showProducts;
window.showOrders = showOrders;
window.showSystem = showSystem;
window.showSystemSettings = showSystemSettings;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin.js loaded successfully');
    
    // 检查用户权限
    checkAdminPermission();
    
    // 加载仪表板数据
    loadDashboardStats();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 启动实时通知
    startRealTimeNotifications();
});

// 检查管理员权限
async function checkAdminPermission() {
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token ? 'exists' : 'not found');
    
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Auth check response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Auth check result:', result);
            
            if (result.success && result.data) {
                adminCurrentUser = result.data;
                
                // 检查是否为管理员
                if (adminCurrentUser.role !== 'ADMIN') {
                    console.log('User is not admin, role:', adminCurrentUser.role);
                    alert('您没有权限访问后台管理页面！');
                    window.location.href = '/';
                    return;
                }
                
                // 更新用户名显示
                const usernameElement = document.getElementById('adminUsername');
                if (usernameElement) {
                    usernameElement.textContent = adminCurrentUser.username;
                }
                
                console.log('Admin permission check passed');
            } else {
                console.log('Auth check failed:', result.message);
                window.location.href = '/login.html';
            }
        } else {
            console.log('Auth check failed with status:', response.status);
            // 未登录，跳转到登录页面
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('检查权限失败:', error);
        window.location.href = '/login.html';
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 用户搜索
    document.getElementById('userSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
    
    // 商品状态筛选
    document.getElementById('productStatusFilter').addEventListener('change', function() {
        filterProducts();
    });
    
    // 订单状态筛选
    document.getElementById('orderStatusFilter').addEventListener('change', function() {
        filterOrders();
    });
}

// 显示仪表板
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').style.display = 'block';
    updateActiveNav('dashboard');
    loadDashboardStats();
}

// 显示用户管理
function showUsers() {
    console.log('showUsers called');
    hideAllSections();
    document.getElementById('users').style.display = 'block';
    updateActiveNav('users');
    loadUsers();
}

// 显示商品管理
function showProducts() {
    console.log('showProducts called');
    hideAllSections();
    document.getElementById('products').style.display = 'block';
    updateActiveNav('products');
    loadProducts();
}

// 显示订单管理
function showOrders() {
    console.log('showOrders called');
    hideAllSections();
    document.getElementById('orders').style.display = 'block';
    updateActiveNav('orders');
    loadOrders();
}

// 显示系统统计
function showSystem() {
    console.log('showSystem called');
    hideAllSections();
    document.getElementById('system').style.display = 'block';
    updateActiveNav('system');
    loadSystemStats();
}

// 隐藏所有内容区域
function hideAllSections() {
    const sections = ['dashboard', 'users', 'products', 'orders', 'system'];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

// 更新活跃导航
function updateActiveNav(activeSection) {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 根据activeSection找到对应的导航链接
    const sectionMap = {
        'dashboard': 0,
        'users': 1,
        'products': 2,
        'orders': 3,
        'system': 4
    };
    
    if (sectionMap[activeSection] !== undefined) {
        navLinks[sectionMap[activeSection]].classList.add('active');
    }
}

// 加载仪表板统计数据
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('No token found, redirecting to login');
            window.location.href = '/login.html';
            return;
        }
        
        const response = await fetch('/api/admin/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const stats = result.data;
            
            // 更新统计卡片
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
            document.getElementById('totalRevenue').textContent = `¥${(stats.totalTransactionAmount || 0).toFixed(2)}`;
            
            // 更新快速统计
            document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
            document.getElementById('activeProducts').textContent = stats.activeProducts || 0;
            document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
        } else {
            console.error('加载仪表板数据失败');
        }
    } catch (error) {
        console.error('加载仪表板数据失败:', error);
    }
}

// 加载用户列表
async function loadUsers(page = 0) {
    try {
        const response = await fetch(`/api/admin/users?page=${page}&size=20`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const users = result.data;
            
            displayUsers(users.content);
            updatePagination('users', users, page);
            currentPage.users = page;
        } else {
            console.error('加载用户列表失败');
        }
    } catch (error) {
        console.error('加载用户列表失败:', error);
    }
}

// 显示用户列表
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.realName || '-'}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge bg-${getRoleBadgeClass(user.role)}">${getUserRoleText(user.role)}</span>
            </td>
            <td>
                <span class="status-badge status-${user.status.toLowerCase()}">${getUserStatusText(user.status)}</span>
            </td>
            <td>${formatDateTime(user.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewUserDetail(${user.id})" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editUser(${user.id})" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteUser(${user.id})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 搜索用户
async function searchUsers() {
    const keyword = document.getElementById('userSearch').value.trim();
    if (!keyword) {
        loadUsers();
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/search?keyword=${encodeURIComponent(keyword)}&page=0&size=20`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const users = result.data;
            
            displayUsers(users.content);
            updatePagination('users', users, 0);
            currentPage.users = 0;
        } else {
            console.error('搜索用户失败');
        }
    } catch (error) {
        console.error('搜索用户失败:', error);
    }
}

// 编辑用户
async function editUser(userId) {
    try {
        // 获取用户信息
        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const user = result.data;
            
            // 填充表单
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editRealName').value = user.realName || '';
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editRole').value = user.role;
            document.getElementById('editStatus').value = user.status;
            
            // 显示模态框
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();
        } else {
            console.error('获取用户信息失败');
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
}

// 保存用户
async function saveUser() {
    const userId = document.getElementById('editUserId').value;
    const userData = {
        realName: document.getElementById('editRealName').value,
        phone: document.getElementById('editPhone').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value
    };
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('用户信息更新成功！');
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            loadUsers(currentPage.users);
        } else {
            const result = await response.json();
            alert('更新失败: ' + result.message);
        }
    } catch (error) {
        console.error('更新用户失败:', error);
        alert('更新失败，请重试');
    }
}

// 删除用户
async function deleteUser(userId) {
    if (!confirm('确定要删除这个用户吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            alert('用户删除成功！');
            loadUsers(currentPage.users);
        } else {
            const result = await response.json();
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除失败，请重试');
    }
}

// 加载商品列表
async function loadProducts(page = 0) {
    try {
        const response = await fetch(`/api/admin/products?page=${page}&size=20`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const products = result.data;
            
            displayProducts(products.content);
            updatePagination('products', products, page);
            currentPage.products = page;
        } else {
            console.error('加载商品列表失败');
        }
    } catch (error) {
        console.error('加载商品列表失败:', error);
    }
}

// 显示商品列表
function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>¥${product.price}</td>
            <td>${getProductCategoryText(product.category)}</td>
            <td>${product.seller.username}</td>
            <td>
                <span class="status-badge status-${product.status.toLowerCase()}">${getProductStatusText(product.status)}</span>
            </td>
            <td>${formatDateTime(product.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewProductDetail(${product.id})" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning btn-action" onclick="updateProductStatus(${product.id}, 'ACTIVE')" title="激活">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="updateProductStatus(${product.id}, 'DELETED')" title="删除">
                    <i class="fas fa-ban"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 筛选商品
function filterProducts() {
    // 这里可以根据状态筛选商品
    loadProducts();
}

// 更新商品状态
async function updateProductStatus(productId, status) {
    const statusText = status === 'ACTIVE' ? '激活' : '删除';
    if (!confirm(`确定要${statusText}这个商品吗？`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/products/${productId}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            alert(`商品${statusText}成功！`);
            loadProducts(currentPage.products);
        } else {
            const result = await response.json();
            alert(`${statusText}失败: ` + result.message);
        }
    } catch (error) {
        console.error(`${statusText}商品失败:`, error);
        alert(`${statusText}失败，请重试`);
    }
}

// 加载订单列表
async function loadOrders(page = 0) {
    try {
        const response = await fetch(`/api/admin/orders?page=${page}&size=20`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const orders = result.data;
            
            displayOrders(orders.content);
            updatePagination('orders', orders, page);
            currentPage.orders = page;
        } else {
            console.error('加载订单列表失败');
        }
    } catch (error) {
        console.error('加载订单列表失败:', error);
    }
}

// 显示订单列表
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.product.title}</td>
            <td>${order.buyer.username}</td>
            <td>${order.seller.username}</td>
            <td>¥${order.amount}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">${getOrderStatusText(order.status)}</span>
            </td>
            <td>${formatDateTime(order.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewOrderDetail(${order.id})" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success btn-action" onclick="updateOrderStatus(${order.id}, 'COMPLETED')" title="完成">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="updateOrderStatus(${order.id}, 'CANCELLED')" title="取消">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 筛选订单
function filterOrders() {
    // 这里可以根据状态筛选订单
    loadOrders();
}

// 更新订单状态
async function updateOrderStatus(orderId, status) {
    const statusText = status === 'COMPLETED' ? '完成' : '取消';
    if (!confirm(`确定要${statusText}这个订单吗？`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            alert(`订单${statusText}成功！`);
            loadOrders(currentPage.orders);
        } else {
            const result = await response.json();
            alert(`${statusText}失败: ` + result.message);
        }
    } catch (error) {
        console.error(`${statusText}订单失败:`, error);
        alert(`${statusText}失败，请重试`);
    }
}

// 加载系统统计
async function loadSystemStats() {
    try {
        const response = await fetch('/api/admin/system/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const stats = result.data;
            
            document.getElementById('recentOrders').textContent = stats.recentOrders || 0;
            document.getElementById('newUsers').textContent = stats.newUsers || 0;
            document.getElementById('newProducts').textContent = stats.newProducts || 0;
        } else {
            console.error('加载系统统计失败');
        }
    } catch (error) {
        console.error('加载系统统计失败:', error);
    }
}

// 更新分页
function updatePagination(type, data, currentPage) {
    const pagination = document.getElementById(`${type}Pagination`);
    pagination.innerHTML = '';
    
    const totalPages = data.totalPages;
    const currentPageNum = data.number;
    
    // 上一页
    if (currentPageNum > 0) {
        const prevLi = document.createElement('li');
        prevLi.className = 'page-item';
        prevLi.innerHTML = `<a class="page-link" href="#" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${currentPageNum - 1})">上一页</a>`;
        pagination.appendChild(prevLi);
    }
    
    // 页码
    for (let i = 0; i < totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPageNum ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${i})">${i + 1}</a>`;
        pagination.appendChild(li);
    }
    
    // 下一页
    if (currentPageNum < totalPages - 1) {
        const nextLi = document.createElement('li');
        nextLi.className = 'page-item';
        nextLi.innerHTML = `<a class="page-link" href="#" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${currentPageNum + 1})">下一页</a>`;
        pagination.appendChild(nextLi);
    }
}

// 工具函数
// 使用app.js中定义的函数

// 使用app.js中定义的函数

// 查看用户详情
function viewUserDetail(userId) {
    // 并行获取用户信息和统计信息
    Promise.all([
        fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        }).then(handleApiResponse),
        fetch(`${API_BASE_URL}/admin/users/${userId}/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        }).then(handleApiResponse)
    ])
    .then(([userData, statsData]) => {
        if (userData.success && statsData.success) {
            const user = userData.data;
            const stats = statsData.data;
            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>基本信息</h5>
                        <p><strong>用户ID:</strong> ${user.id}</p>
                        <p><strong>用户名:</strong> ${user.username}</p>
                        <p><strong>邮箱:</strong> ${user.email}</p>
                        <p><strong>真实姓名:</strong> ${user.realName || '未设置'}</p>
                        <p><strong>手机号:</strong> ${user.phone || '未设置'}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>账户信息</h5>
                        <p><strong>角色:</strong> <span class="badge bg-${getRoleBadgeClass(user.role)}">${getUserRoleText(user.role)}</span></p>
                        <p><strong>状态:</strong> <span class="status-badge status-${user.status.toLowerCase()}">${getUserStatusText(user.status)}</span></p>
                        <p><strong>注册时间:</strong> ${formatDateTime(user.createdAt)}</p>
                        <p><strong>最后登录:</strong> ${user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '从未登录'}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <h5>统计信息</h5>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="text-center">
                                    <h4 class="text-primary">${stats.productCount || 0}</h4>
                                    <p class="text-muted">发布商品</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center">
                                    <h4 class="text-success">${stats.orderCount || 0}</h4>
                                    <p class="text-muted">完成订单</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center">
                                    <h4 class="text-warning">0</h4>
                                    <p class="text-muted">收到评价</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 创建临时模态框显示用户详情
            const modalHtml = `
                <div class="modal fade" id="userDetailModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">用户详情</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${content}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 移除已存在的模态框
            const existingModal = document.getElementById('userDetailModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 添加新模态框
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
            modal.show();
            
            // 模态框关闭后移除DOM元素
            document.getElementById('userDetailModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        } else {
            showErrorToast('获取用户详情失败');
        }
    })
    .catch(error => {
        console.error('Error fetching user detail:', error);
        showErrorToast('网络错误，获取用户详情失败');
    });
}

// 显示系统设置
function showSystemSettings() {
    // 隐藏所有内容区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // 显示系统设置模态框
    const modal = new bootstrap.Modal(document.getElementById('systemSettingsModal'));
    modal.show();
}

// 保存系统设置
function saveSystemSettings() {
    const settings = {
        systemName: document.getElementById('systemName').value,
        systemDescription: document.getElementById('systemDescription').value,
        maintenanceMode: document.getElementById('maintenanceMode').checked,
        allowRegistration: document.getElementById('allowRegistration').checked
    };
    
    // 这里可以调用API保存设置
    console.log('保存系统设置:', settings);
    showSuccessToast('系统设置已保存');
    
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('systemSettingsModal'));
    modal.hide();
}

// 查看商品详情
function viewProductDetail(productId) {
    fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(handleApiResponse)
    .then(data => {
        if (data.success) {
            const product = data.data;
            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>商品信息</h5>
                        <p><strong>标题:</strong> ${product.title}</p>
                        <p><strong>价格:</strong> ¥${product.price}</p>
                        <p><strong>分类:</strong> ${getProductCategoryText(product.category)}</p>
                        <p><strong>状态:</strong> <span class="badge bg-${getProductStatusClass(product.status)}">${getProductStatusText(product.status)}</span></p>
                        <p><strong>发布时间:</strong> ${new Date(product.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>卖家信息</h5>
                        <p><strong>用户名:</strong> ${product.seller ? product.seller.username : 'N/A'}</p>
                        <p><strong>邮箱:</strong> ${product.seller ? product.seller.email : 'N/A'}</p>
                        <p><strong>手机:</strong> ${product.seller ? product.seller.phone : 'N/A'}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <h5>商品描述</h5>
                        <p>${product.description}</p>
                    </div>
                </div>
                ${product.images ? `
                <div class="row mt-3">
                    <div class="col-12">
                        <h5>商品图片</h5>
                        <div class="row">
                            ${product.images.split(',').map(img => `
                                <div class="col-md-3 mb-2">
                                    <img src="/uploads/${img.trim()}" class="img-fluid rounded" alt="商品图片">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
            `;
            
            document.getElementById('productDetailContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
            modal.show();
        } else {
            showErrorToast('获取商品详情失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching product detail:', error);
        showErrorToast('网络错误，获取商品详情失败');
    });
}

// 查看订单详情
function viewOrderDetail(orderId) {
    fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(handleApiResponse)
    .then(data => {
        if (data.success) {
            const order = data.data;
            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>订单信息</h5>
                        <p><strong>订单ID:</strong> ${order.id}</p>
                        <p><strong>金额:</strong> ¥${order.amount}</p>
                        <p><strong>状态:</strong> <span class="badge bg-${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span></p>
                        <p><strong>创建时间:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                        ${order.paidAt ? `<p><strong>支付时间:</strong> ${new Date(order.paidAt).toLocaleString()}</p>` : ''}
                        ${order.completedAt ? `<p><strong>完成时间:</strong> ${new Date(order.completedAt).toLocaleString()}</p>` : ''}
                    </div>
                    <div class="col-md-6">
                        <h5>商品信息</h5>
                        <p><strong>商品标题:</strong> ${order.product ? order.product.title : 'N/A'}</p>
                        <p><strong>商品价格:</strong> ${order.product ? '¥' + order.product.price : 'N/A'}</p>
                        <p><strong>商品分类:</strong> ${order.product ? getProductCategoryText(order.product.category) : 'N/A'}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <h5>买家信息</h5>
                        <p><strong>用户名:</strong> ${order.buyer ? order.buyer.username : 'N/A'}</p>
                        <p><strong>邮箱:</strong> ${order.buyer ? order.buyer.email : 'N/A'}</p>
                        <p><strong>手机:</strong> ${order.buyer ? order.buyer.phone : 'N/A'}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>卖家信息</h5>
                        <p><strong>用户名:</strong> ${order.seller ? order.seller.username : 'N/A'}</p>
                        <p><strong>邮箱:</strong> ${order.seller ? order.seller.email : 'N/A'}</p>
                        <p><strong>手机:</strong> ${order.seller ? order.seller.phone : 'N/A'}</p>
                    </div>
                </div>
            `;
            
            document.getElementById('orderDetailContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
            modal.show();
        } else {
            showErrorToast('获取订单详情失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching order detail:', error);
        showErrorToast('网络错误，获取订单详情失败');
    });
}

// 导出数据
function exportData(type) {
    let url = '';
    switch(type) {
        case 'users':
            url = `${API_BASE_URL}/admin/export/users`;
            break;
        case 'products':
            url = `${API_BASE_URL}/admin/export/products`;
            break;
        case 'orders':
            url = `${API_BASE_URL}/admin/export/orders`;
            break;
        default:
            showErrorToast('未知的导出类型');
            return;
    }
    
    // 发送带认证的请求
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('导出失败');
        }
        return response.text();
    })
    .then(csvData => {
        // 创建下载链接
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccessToast(`${type}数据导出成功`);
    })
    .catch(error => {
        console.error('Export error:', error);
        showErrorToast('导出失败，请重试');
    });
}

// 实时通知系统
function startRealTimeNotifications() {
    // 每30秒检查一次新数据
    setInterval(() => {
        checkForNewData();
    }, 30000);
}

// 检查新数据
async function checkForNewData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const stats = result.data;
                
                // 检查是否有新的待处理订单
                if (stats.pendingOrders > 0) {
                    showNotification('有新的待处理订单', 'warning', 'fas fa-shopping-cart');
                }
                
                // 检查是否有新的用户注册
                if (stats.totalUsers > (window.lastUserCount || 0)) {
                    showNotification('有新用户注册', 'info', 'fas fa-user-plus');
                    window.lastUserCount = stats.totalUsers;
                }
                
                // 检查是否有新的商品发布
                if (stats.totalProducts > (window.lastProductCount || 0)) {
                    showNotification('有新商品发布', 'success', 'fas fa-box');
                    window.lastProductCount = stats.totalProducts;
                }
            }
        }
    } catch (error) {
        console.error('检查新数据失败:', error);
    }
}

// 显示通知
function showNotification(message, type, icon) {
    const notificationId = 'notification-' + Date.now();
    const notificationHtml = `
        <div id="${notificationId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="${icon} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // 创建通知容器（如果不存在）
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // 添加通知
    container.insertAdjacentHTML('beforeend', notificationHtml);
    
    // 显示通知
    const toastElement = document.getElementById(notificationId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // 通知显示后移除DOM元素
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// 显示成功消息
function showSuccessMessage(message) {
    showNotification(message, 'success', 'fas fa-check-circle');
}

// 显示错误消息
function showErrorMessage(message) {
    showNotification(message, 'danger', 'fas fa-exclamation-circle');
}

// 显示警告消息
function showWarningMessage(message) {
    showNotification(message, 'warning', 'fas fa-exclamation-triangle');
}

// 显示信息消息
function showInfoMessage(message) {
    showNotification(message, 'info', 'fas fa-info-circle');
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}
