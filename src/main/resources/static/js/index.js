// 首页相关功能
let currentPage = 0;
let currentCategory = '';
let currentKeyword = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadPopularProducts();
    loadLatestProducts();
    setupSearchHandlers();
});

// 加载热门商品
function loadPopularProducts() {
    const container = document.getElementById('popularProducts');
    if (!container) return;
    
    showLoading(container, '加载热门商品...');
    
    fetch(`${app.API_BASE_URL}/products/popular?page=0&size=8`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProducts(data.data.content, container);
            } else {
                container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载热门商品失败</p></div></div>';
            }
        })
        .catch(error => {
            console.error('加载热门商品失败:', error);
            container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>网络错误，请稍后重试</p></div></div>';
        });
}

// 加载最新商品
function loadLatestProducts() {
    const container = document.getElementById('latestProducts');
    if (!container) return;
    
    showLoading(container, '加载最新商品...');
    
    fetch(`${app.API_BASE_URL}/products/latest?page=0&size=8`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProducts(data.data.content, container);
            } else {
                container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载最新商品失败</p></div></div>';
            }
        })
        .catch(error => {
            console.error('加载最新商品失败:', error);
            container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>网络错误，请稍后重试</p></div></div>';
        });
}

// 显示商品列表
function displayProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-box-open"></i><p>暂无商品</p></div></div>';
        return;
    }
    
    const html = products.map(product => createProductCard(product)).join('');
    container.innerHTML = html;
}

// 创建商品卡片
function createProductCard(product) {
    const imageUrl = product.images ? `/uploads/${product.images.split(',')[0]}` : 'https://via.placeholder.com/300x200?text=No+Image';
    const statusClass = getStatusClass(product.status);
    const statusText = getStatusText(product.status);
    
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100" onclick="showProductDetail(${product.id})">
                <img src="${imageUrl}" class="card-img-top product-image" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title product-title">${product.title}</h6>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="product-price">${app.formatPrice(product.price)}</span>
                            <span class="status-badge status-${statusClass}">${statusText}</span>
                        </div>
                        <div class="product-meta">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>${product.seller.username}
                                <i class="fas fa-eye ms-2 me-1"></i>${product.viewCount || 0}
                                <i class="fas fa-heart ms-2 me-1"></i>${product.likeCount || 0}
                            </small>
                        </div>
                        <div class="product-meta">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>${app.formatRelativeTime(product.createdAt)}
                            </small>
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

// 显示商品详情
function showProductDetail(productId) {
    fetch(`${app.API_BASE_URL}/products/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const product = data.data;
                displayProductModal(product);
            } else {
                app.showMessage('获取商品详情失败', 'danger');
            }
        })
        .catch(error => {
            console.error('获取商品详情失败:', error);
            app.showMessage('网络错误，请稍后重试', 'danger');
        });
}

// 显示商品详情模态框
function displayProductModal(product) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const body = document.getElementById('productModalBody');
    const buyButton = document.getElementById('buyButton');
    
    if (!modal || !title || !body || !buyButton) return;
    
    title.textContent = product.title;
    
    const images = product.images ? product.images.split(',') : [];
    const imageHtml = images.length > 0 ? 
        `<img src="/uploads/${images[0]}" class="img-fluid rounded mb-3" alt="${product.title}" style="max-height: 300px;">` :
        '<div class="text-center p-5 bg-light rounded mb-3"><i class="fas fa-image fa-3x text-muted"></i><p class="mt-2 text-muted">暂无图片</p></div>';
    
    body.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                ${imageHtml}
            </div>
            <div class="col-md-6">
                <h4 class="text-primary">${app.formatPrice(product.price)}</h4>
                <p class="text-muted mb-3">${product.description}</p>
                <div class="mb-3">
                    <strong>分类：</strong>
                    <span class="badge bg-secondary">${getCategoryText(product.category)}</span>
                </div>
                <div class="mb-3">
                    <strong>卖家：</strong>
                    <span>${product.seller.username}</span>
                </div>
                <div class="mb-3">
                    <strong>发布时间：</strong>
                    <span>${app.formatDate(product.createdAt)}</span>
                </div>
                <div class="mb-3">
                    <strong>浏览量：</strong>
                    <span>${product.viewCount || 0}</span>
                </div>
                <div class="mb-3">
                    <strong>状态：</strong>
                    <span class="status-badge status-${getStatusClass(product.status)}">${getStatusText(product.status)}</span>
                </div>
            </div>
        </div>
    `;
    
    // 设置购买按钮
    buyButton.onclick = () => buyProduct(product.id);
    buyButton.style.display = product.status === 'ACTIVE' && product.seller.id !== app.currentUser()?.id ? 'block' : 'none';
    
    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// 购买商品
function buyProduct(productId) {
    if (!app.requireAuth()) return;
    
    const remark = prompt('请输入购买备注（可选）：');
    if (remark === null) return; // 用户取消
    
    const orderData = {
        productId: productId,
        remark: remark || ''
    };
    
    fetch(`${app.API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${app.authToken()}`
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('订单创建成功！', 'success');
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            if (modal) modal.hide();
            // 刷新商品列表
            loadPopularProducts();
            loadLatestProducts();
        } else {
            app.showMessage(data.message || '订单创建失败', 'danger');
        }
    })
    .catch(error => {
        console.error('创建订单失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 获取分类文本
function getCategoryText(category) {
    const categoryMap = {
        'ELECTRONICS': '电子产品',
        'BOOKS': '图书教材',
        'CLOTHING': '服装配饰',
        'SPORTS': '运动用品',
        'DAILY': '生活用品',
        'STUDY': '学习用品',
        'BEAUTY': '美妆护肤',
        'FOOD': '食品饮料',
        'OTHER': '其他'
    };
    return categoryMap[category] || '其他';
}

// 设置搜索处理器
function setupSearchHandlers() {
    const searchInput = document.getElementById('searchKeyword');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        // 搜索框回车事件
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        // 搜索框输入防抖
        searchInput.addEventListener('input', app.debounce(function() {
            // 这里可以添加搜索建议功能
        }, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterByCategory(this.value);
        });
    }
}

// 搜索商品
function searchProducts() {
    const keyword = document.getElementById('searchKeyword')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    
    // 跳转到商品页面进行搜索
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    
    const queryString = params.toString();
    window.location.href = `products.html${queryString ? '?' + queryString : ''}`;
}

// 按分类筛选
function filterByCategory(category) {
    if (category) {
        window.location.href = `products.html?category=${category}`;
    } else {
        window.location.href = 'products.html';
    }
}

// 导出函数供HTML调用
window.showProductDetail = showProductDetail;
window.buyProduct = buyProduct;
window.searchProducts = searchProducts;
window.filterByCategory = filterByCategory;
