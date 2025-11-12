// 评价页面相关功能
let currentPage = 0;
let totalPages = 0;
let reviewType = 'given'; // 'received' 或 'given'

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
    // 加载评价统计
    loadReviewStats();
    
    // 加载给出的评价
    loadGivenReviews();
    
    // 设置事件监听器
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 按钮状态切换
    const receivedBtn = document.getElementById('receivedReviewsBtn');
    const givenBtn = document.getElementById('givenReviewsBtn');
    
    if (receivedBtn) {
        receivedBtn.addEventListener('click', function() {
            receivedBtn.classList.add('active');
            givenBtn.classList.remove('active');
            reviewType = 'received';
            currentPage = 0;
            loadReceivedReviews();
        });
    }
    
    if (givenBtn) {
        givenBtn.addEventListener('click', function() {
            givenBtn.classList.add('active');
            receivedBtn.classList.remove('active');
            reviewType = 'given';
            currentPage = 0;
            loadGivenReviews();
        });
    }
}

// 加载评价统计
function loadReviewStats() {
    const container = document.getElementById('reviewStats');
    if (!container) return;
    
    const token = app.authToken();
    if (!token) return;
    
    fetch(`${app.API_BASE_URL}/reviews/my-stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayReviewStats(data.data, container);
        } else {
            container.innerHTML = '<div class="col-12"><p class="text-muted">加载评价统计失败</p></div>';
        }
    })
    .catch(error => {
        console.error('加载评价统计失败:', error);
        container.innerHTML = '<div class="col-12"><p class="text-muted">网络错误，请稍后重试</p></div>';
    });
}

// 显示评价统计
function displayReviewStats(stats, container) {
    const averageRating = stats.averageRating ? stats.averageRating.toFixed(1) : '0.0';
    const totalReviews = stats.totalReviews || 0;
    const goodReviews = stats.goodReviews || 0;
    const badReviews = stats.badReviews || 0;
    
    container.innerHTML = `
        <div class="col-md-3">
            <div class="text-center">
                <h3 class="text-primary">${averageRating}</h3>
                <p class="text-muted mb-0">平均评分</p>
                <div class="mt-2">
                    ${generateStarRating(averageRating)}
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="text-center">
                <h3 class="text-success">${totalReviews}</h3>
                <p class="text-muted mb-0">总评价数</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="text-center">
                <h3 class="text-info">${goodReviews}</h3>
                <p class="text-muted mb-0">好评数 (≥4星)</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="text-center">
                <h3 class="text-danger">${badReviews}</h3>
                <p class="text-muted mb-0">差评数 (≤2星)</p>
            </div>
        </div>
    `;
}

// 生成星级评分
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star text-warning"></i>';
    }
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star text-warning"></i>';
    }
    return html;
}

// 加载收到的评价
function loadReceivedReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    showLoading(container, '加载收到的评价...');
    
    const token = app.authToken();
    if (!token) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>请先登录</p></div>';
        return;
    }
    
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('size', 10);
    
    fetch(`${app.API_BASE_URL}/reviews/my-reviews?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || '加载评价失败');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('收到的评价数据:', data); // 调试输出
        if (data.success) {
            if (data.data && data.data.content) {
                totalPages = data.data.totalPages || 0;
                displayReviews(data.data.content, container);
                updatePagination();
            } else {
                console.warn('返回数据格式不正确:', data);
                container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>暂无评价</p></div>';
            }
        } else {
            console.error('API返回错误:', data.message);
            container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${data.message || '加载评价失败'}</p></div>`;
        }
    })
    .catch(error => {
        console.error('加载收到的评价失败:', error);
        container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${error.message || '网络错误，请稍后重试'}</p></div>`;
    });
}

// 加载给出的评价
function loadGivenReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    showLoading(container, '加载给出的评价...');
    
    const token = app.authToken();
    if (!token) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>请先登录</p></div>';
        return;
    }
    
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('size', 10);
    
    fetch(`${app.API_BASE_URL}/reviews/my-given-reviews?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || '加载评价失败');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('给出的评价数据:', data); // 调试输出
        if (data.success) {
            if (data.data && data.data.content) {
                totalPages = data.data.totalPages || 0;
                displayReviews(data.data.content, container);
                updatePagination();
            } else {
                console.warn('返回数据格式不正确:', data);
                container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>暂无评价</p></div>';
            }
        } else {
            console.error('API返回错误:', data.message);
            container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${data.message || '加载评价失败'}</p></div>`;
        }
    })
    .catch(error => {
        console.error('加载给出的评价失败:', error);
        container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${error.message || '网络错误，请稍后重试'}</p></div>`;
    });
}

// 显示评价列表
function displayReviews(reviews, container) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>暂无评价</p></div>';
        return;
    }
    
    const html = reviews.map(review => createReviewCard(review)).join('');
    container.innerHTML = html;
}

// 创建评价卡片
function createReviewCard(review) {
    const rating = review.rating || 0;
    const isReceived = reviewType === 'received';
    const otherUser = isReceived ? (review.reviewer || {}) : (review.reviewee || {});
    const typeText = review.type === 'BUYER_TO_SELLER' ? '买家评价卖家' : '卖家评价买家';
    const order = review.order || {};
    const product = order.product || {};
    
    return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center mb-2">
                            <h6 class="mb-0 me-3">${typeText}</h6>
                            <span class="badge bg-secondary">${isReceived ? '收到的评价' : '给出的评价'}</span>
                        </div>
                        <div class="mb-2">
                            ${generateStarRating(rating)}
                            <span class="ms-2">${rating} 星</span>
                        </div>
                        <p class="mb-2"><strong>${isReceived ? '评价者' : '被评价者'}:</strong> ${otherUser.username || '未知用户'}</p>
                        ${order.orderNumber ? `<p class="mb-2"><strong>订单号:</strong> ${order.orderNumber}</p>` : ''}
                        ${product.title ? `<p class="mb-2"><strong>商品:</strong> ${product.title}</p>` : ''}
                        <p class="mb-0"><strong>评价内容:</strong> ${review.content || ''}</p>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <p class="text-muted mb-2">
                            <small>${app.formatDate(review.createdAt)}</small>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    `;
}

// 查看评价详情
function viewReviewDetail(reviewId) {
    const token = app.authToken();
    if (!token) return;
    
    fetch(`${app.API_BASE_URL}/reviews/${reviewId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayReviewDetailModal(data.data);
        } else {
            app.showMessage('获取评价详情失败', 'danger');
        }
    })
    .catch(error => {
        console.error('获取评价详情失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 显示评价详情模态框
function displayReviewDetailModal(review) {
    const modal = document.getElementById('reviewDetailModal');
    const body = document.getElementById('reviewDetailBody');
    
    if (!modal || !body) return;
    
    const rating = review.rating || 0;
    const typeText = review.type === 'BUYER_TO_SELLER' ? '买家评价卖家' : '卖家评价买家';
    const order = review.order || {};
    const product = order.product || {};
    const reviewer = review.reviewer || {};
    const reviewee = review.reviewee || {};
    
    body.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>评价信息</h6>
                <p><strong>评价类型:</strong> ${typeText}</p>
                <p><strong>评分:</strong> ${generateStarRating(rating)} ${rating} 星</p>
                <p><strong>评价时间:</strong> ${app.formatDate(review.createdAt)}</p>
                ${review.updatedAt ? `<p><strong>更新时间:</strong> ${app.formatDate(review.updatedAt)}</p>` : ''}
            </div>
            <div class="col-md-6">
                <h6>订单信息</h6>
                ${order.orderNumber ? `<p><strong>订单号:</strong> ${order.orderNumber}</p>` : '<p><strong>订单号:</strong> 未知</p>'}
                ${product.title ? `<p><strong>商品:</strong> ${product.title}</p>` : '<p><strong>商品:</strong> 未知</p>'}
                ${order.amount ? `<p><strong>金额:</strong> ${app.formatPrice(order.amount)}</p>` : ''}
                <h6 class="mt-3">用户信息</h6>
                <p><strong>评价者:</strong> ${reviewer.username || '未知用户'}</p>
                <p><strong>被评价者:</strong> ${reviewee.username || '未知用户'}</p>
            </div>
        </div>
        <div class="mt-3">
            <h6>评价内容</h6>
            <p class="border p-3 rounded">${review.content || ''}</p>
        </div>
    `;
    
    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
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
    if (reviewType === 'received') {
        loadReceivedReviews();
    } else {
        loadGivenReviews();
    }
    window.scrollTo(0, 0);
}

// 显示加载状态
function showLoading(container, message = '加载中...') {
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">${message}</p>
        </div>
    `;
}

// 导出函数供HTML调用
window.loadReceivedReviews = loadReceivedReviews;
window.loadGivenReviews = loadGivenReviews;
window.viewReviewDetail = viewReviewDetail;
window.goToPage = goToPage;

