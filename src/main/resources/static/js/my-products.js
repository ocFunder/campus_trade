// 我的商品页面相关功能
let currentPage = 0;
let currentStatus = '';
let currentCategory = '';
let totalPages = 0;
let totalElements = 0;

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
    // 从URL参数获取筛选条件
    const urlParams = new URLSearchParams(window.location.search);
    currentStatus = urlParams.get('status') || '';
    currentCategory = urlParams.get('category') || '';
    
    // 设置表单值
    setFormValues();
    
    // 加载我的商品
    loadMyProducts();
    
    // 设置事件监听器
    setupEventListeners();
}

// 设置表单值
function setFormValues() {
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (statusFilter) statusFilter.value = currentStatus;
    if (categoryFilter) categoryFilter.value = currentCategory;
}

// 设置事件监听器
function setupEventListeners() {
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentStatus = this.value;
            currentPage = 0;
            loadMyProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            currentPage = 0;
            loadMyProducts();
        });
    }
}

// 加载我的商品
function loadMyProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    showLoading(container, '加载我的商品...');
    
    // 构建API URL
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('size', 12);
    if (currentStatus) params.set('status', currentStatus);
    if (currentCategory) params.set('category', currentCategory);
    
    const apiUrl = `${API_BASE_URL}/products/my-products?${params.toString()}`;
    
    fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            totalPages = data.data.totalPages;
            totalElements = data.data.totalElements;
            displayMyProducts(data.data.content, container);
            updatePagination();
        } else {
            container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载商品失败</p></div></div>';
        }
    })
    .catch(error => {
        console.error('加载我的商品失败:', error);
        container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>网络错误，请稍后重试</p></div></div>';
    });
}

// 显示我的商品列表
function displayMyProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-box-open"></i><p>暂无商品</p><a href="publish.html" class="btn btn-primary">发布商品</a></div></div>';
        return;
    }
    
    const html = products.map(product => createMyProductCard(product)).join('');
    container.innerHTML = html;
}

// 创建我的商品卡片
function createMyProductCard(product) {
    const imageUrl = product.images ? `/uploads/${product.images.split(',')[0]}` : 'https://via.placeholder.com/300x200?text=No+Image';
    const statusClass = getStatusClass(product.status);
    const statusText = getStatusText(product.status);
    
    return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card h-100">
                <img src="${imageUrl}" class="card-img-top product-image" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title product-title">${product.title}</h6>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="product-price">${app.formatPrice(product.price)}</span>
                            <span class="status-badge status-${statusClass}">${statusText}</span>
                        </div>
                        <div class="product-meta mb-3">
                            <small class="text-muted">
                                <i class="fas fa-eye me-1"></i>${product.viewCount || 0}
                                <i class="fas fa-heart ms-2 me-1"></i>${product.likeCount || 0}
                                <i class="fas fa-clock ms-2 me-1"></i>${app.formatRelativeTime(product.createdAt)}
                            </small>
                        </div>
                        <div class="btn-group w-100" role="group">
                            <button type="button" class="btn btn-outline-primary btn-sm" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit me-1"></i>编辑
                            </button>
                            <button type="button" class="btn btn-outline-info btn-sm" onclick="viewProduct(${product.id})">
                                <i class="fas fa-eye me-1"></i>查看
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash me-1"></i>删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 获取状态样式类
function getStatusClass(status) {
    switch (status) {
        case 'ACTIVE': return 'active';
        case 'SOLD': return 'sold';
        case 'RESERVED': return 'reserved';
        default: return 'active';
    }
}

// 获取状态文本
function getStatusText(status) {
    switch (status) {
        case 'ACTIVE': return '在售';
        case 'SOLD': return '已售';
        case 'RESERVED': return '预订';
        case 'DELETED': return '已删除';
        case 'BANNED': return '已下架';
        default: return '在售';
    }
}

// 编辑商品
function editProduct(productId) {
    // 获取商品详情并填充编辑表单
    fetch(`${app.API_BASE_URL}/products/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const product = data.data;
                populateEditForm(product);
                const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
                modal.show();
            } else {
                app.showMessage('获取商品详情失败', 'danger');
            }
        })
        .catch(error => {
            console.error('获取商品详情失败:', error);
            app.showMessage('网络错误，请稍后重试', 'danger');
        });
}

// 填充编辑表单
function populateEditForm(product) {
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editTitle').value = product.title;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editImages').value = product.images || '';
}

// 更新商品
function updateProduct() {
    const productId = document.getElementById('editProductId').value;
    const productData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        price: parseFloat(document.getElementById('editPrice').value),
        category: document.getElementById('editCategory').value,
        images: document.getElementById('editImages').value
    };
    
    fetch(`${app.API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${app.authToken()}`
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('商品更新成功！', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            if (modal) modal.hide();
            loadMyProducts();
        } else {
            app.showMessage(data.message || '商品更新失败', 'danger');
        }
    })
    .catch(error => {
        console.error('更新商品失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 查看商品
function viewProduct(productId) {
    window.open(`products.html?id=${productId}`, '_blank');
}

// 删除商品
function deleteProduct(productId) {
    if (!confirm('确定要删除这个商品吗？删除后无法恢复。')) {
        return;
    }
    
    fetch(`${app.API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('商品删除成功！', 'success');
            loadMyProducts();
        } else {
            app.showMessage(data.message || '商品删除失败', 'danger');
        }
    })
    .catch(error => {
        console.error('删除商品失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 更新分页
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // 上一页
    if (currentPage > 0) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${currentPage - 1})">上一页</a></li>`;
    }
    
    // 页码
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="goToPage(${i})">${i + 1}</a></li>`;
    }
    
    // 下一页
    if (currentPage < totalPages - 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">下一页</a></li>`;
    }
    
    pagination.innerHTML = html;
}

// 跳转到指定页面
function goToPage(page) {
    currentPage = page;
    loadMyProducts();
    window.scrollTo(0, 0);
}

// 显示加载状态
function showLoading(container, message = '加载中...') {
    container.innerHTML = `
        <div class="col-12">
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">${message}</p>
            </div>
        </div>
    `;
}

// 导出函数供HTML调用
window.loadMyProducts = loadMyProducts;
window.editProduct = editProduct;
window.updateProduct = updateProduct;
window.viewProduct = viewProduct;
window.deleteProduct = deleteProduct;
window.goToPage = goToPage;
