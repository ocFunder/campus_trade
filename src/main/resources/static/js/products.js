// 商品页面相关功能
let currentPage = 0;
let currentCategory = '';
let currentKeyword = '';
let currentSort = 'latest';
let totalPages = 0;
let totalElements = 0;
let currentViewMode = 'grid'; // 'grid' 或 'list'

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从URL参数获取筛选条件
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || '';
    currentKeyword = urlParams.get('keyword') || '';
    currentSort = urlParams.get('sort') || 'latest';
    
    // 设置页面标题
    updatePageTitle();
    
    // 设置表单值
    setFormValues();
    
    // 加载商品
    loadProducts();
    
    // 设置事件监听器
    setupEventListeners();
});

// 更新页面标题
function updatePageTitle() {
    const titleElement = document.getElementById('pageTitle');
    if (!titleElement) return;
    
    let title = '商品列表';
    if (currentCategory) {
        const categoryText = getCategoryText(currentCategory);
        title = `${categoryText} - ${title}`;
    }
    if (currentKeyword) {
        title = `"${currentKeyword}" - ${title}`;
    }
    
    titleElement.textContent = title;
    document.title = title + ' - 校园二手交易平台';
}

// 设置表单值
function setFormValues() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchKeyword = document.getElementById('searchKeyword');
    const sortBy = document.getElementById('sortBy');
    
    if (categoryFilter) categoryFilter.value = currentCategory;
    if (searchKeyword) searchKeyword.value = currentKeyword;
    if (sortBy) sortBy.value = currentSort;
}

// 设置事件监听器
function setupEventListeners() {
    const searchInput = document.getElementById('searchKeyword');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            currentPage = 0;
            updateURL();
            loadProducts();
        });
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 0;
            updateURL();
            loadProducts();
        });
    }
    
    // 视图切换事件监听器
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (gridView) {
        gridView.addEventListener('change', function() {
            if (this.checked) {
                currentViewMode = 'grid';
                renderProducts();
            }
        });
    }
    
    if (listView) {
        listView.addEventListener('change', function() {
            if (this.checked) {
                currentViewMode = 'list';
                renderProducts();
            }
        });
    }
}

// 更新URL
function updateURL() {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentKeyword) params.set('keyword', currentKeyword);
    if (currentSort && currentSort !== 'latest') params.set('sort', currentSort);
    
    const queryString = params.toString();
    const newURL = `products.html${queryString ? '?' + queryString : ''}`;
    window.history.pushState({}, '', newURL);
    updatePageTitle();
}

// 加载商品
function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    showLoading(container, '加载商品中...');
    
    // 构建API URL
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('size', 12);
    
    let apiUrl = `${app.API_BASE_URL}/products`;
    
    // 根据分类和排序选择API端点
    if (currentCategory) {
        apiUrl = `${app.API_BASE_URL}/products/category/${currentCategory}`;
    } else if (currentSort === 'popular') {
        apiUrl = `${app.API_BASE_URL}/products/popular`;
    } else if (currentSort === 'latest') {
        apiUrl = `${app.API_BASE_URL}/products/latest`;
    }
    
    // 添加其他参数
    if (currentKeyword) params.set('keyword', currentKeyword);
    if (currentSort && !currentCategory) params.set('sort', currentSort);
    
    fetch(`${apiUrl}?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                totalPages = data.data.totalPages;
                totalElements = data.data.totalElements;
                displayProducts(data.data.content, container);
                updatePagination();
                updateTotalCount();
            } else {
                container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载商品失败</p></div></div>';
            }
        })
        .catch(error => {
            console.error('加载商品失败:', error);
            container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>网络错误，请稍后重试</p></div></div>';
        });
}

// 显示商品列表
function displayProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-box-open"></i><p>暂无商品</p></div></div>';
        return;
    }
    
    // 存储当前商品数据
    window.currentProducts = products;
    
    // 渲染商品
    renderProducts();
}

// 渲染商品（支持不同视图模式）
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container || !window.currentProducts) return;
    
    const products = window.currentProducts;
    
    if (currentViewMode === 'list') {
        const html = products.map(product => createProductListItem(product)).join('');
        container.innerHTML = html;
    } else {
        const html = products.map(product => createProductCard(product)).join('');
        container.innerHTML = html;
    }
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

// 创建商品列表项（列表视图）
function createProductListItem(product) {
    const imageUrl = product.images ? `/uploads/${product.images.split(',')[0]}` : 'https://via.placeholder.com/300x200?text=No+Image';
    const statusClass = getStatusClass(product.status);
    const statusText = getStatusText(product.status);
    
    return `
        <div class="col-12 mb-3">
            <div class="card product-list-item" onclick="showProductDetail(${product.id})">
                <div class="row g-0">
                    <div class="col-md-3">
                        <img src="${imageUrl}" class="img-fluid rounded-start product-list-image" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h5 class="card-title product-title">${product.title}</h5>
                                    <p class="card-text product-description">${product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}</p>
                                    <div class="product-meta">
                                        <small class="text-muted">
                                            <i class="fas fa-user me-1"></i>${product.seller.username}
                                            <i class="fas fa-eye ms-3 me-1"></i>${product.viewCount || 0}
                                            <i class="fas fa-heart ms-3 me-1"></i>${product.likeCount || 0}
                                            <i class="fas fa-clock ms-3 me-1"></i>${app.formatRelativeTime(product.createdAt)}
                                        </small>
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <div class="product-price-large">${app.formatPrice(product.price)}</div>
                                    <span class="status-badge status-${statusClass}">${statusText}</span>
                                    <div class="mt-2">
                                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showProductDetail(${product.id})">
                                            <i class="fas fa-eye me-1"></i>查看详情
                                        </button>
                                    </div>
                                </div>
                            </div>
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
            loadProducts();
        } else {
            app.showMessage(data.message || '订单创建失败', 'danger');
        }
    })
    .catch(error => {
        console.error('创建订单失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 搜索商品
function searchProducts() {
    const keyword = document.getElementById('searchKeyword')?.value || '';
    currentKeyword = keyword;
    currentPage = 0;
    updateURL();
    loadProducts();
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
    loadProducts();
    window.scrollTo(0, 0);
}

// 更新总数显示
function updateTotalCount() {
    const totalCountElement = document.getElementById('totalCount');
    if (totalCountElement) {
        totalCountElement.textContent = totalElements;
    }
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
window.showProductDetail = showProductDetail;
window.buyProduct = buyProduct;
window.searchProducts = searchProducts;
window.goToPage = goToPage;
