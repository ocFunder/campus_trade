// 我的订单页面相关功能
let currentPage = 0;
let currentStatus = '';
let orderType = '';
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
    orderType = urlParams.get('type') || '';
    
    // 设置表单值
    setFormValues();
    
    // 加载我的订单
    loadMyOrders();
    
    // 设置事件监听器
    setupEventListeners();
}

// 设置表单值
function setFormValues() {
    const statusFilter = document.getElementById('statusFilter');
    const orderTypeFilter = document.getElementById('orderTypeFilter');
    
    if (statusFilter) statusFilter.value = currentStatus;
    if (orderTypeFilter) orderTypeFilter.value = orderType;
}

// 设置事件监听器
function setupEventListeners() {
    const statusFilter = document.getElementById('statusFilter');
    const orderTypeFilter = document.getElementById('orderTypeFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentStatus = this.value;
            currentPage = 0;
            loadMyOrders();
        });
    }
    
    if (orderTypeFilter) {
        orderTypeFilter.addEventListener('change', function() {
            orderType = this.value;
            currentPage = 0;
            loadMyOrders();
        });
    }
}

// 加载我的订单
function loadMyOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;
    
    showLoading(container, '加载我的订单...');
    
    // 构建API URL
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('size', 10);
    if (currentStatus) params.set('status', currentStatus);
    if (orderType) params.set('type', orderType);
    
    const apiUrl = `${API_BASE_URL}/orders/my-orders?${params.toString()}`;
    
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
            displayMyOrders(data.data.content, container);
            updatePagination();
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载订单失败</p></div>';
        }
    })
    .catch(error => {
        console.error('加载我的订单失败:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>网络错误，请稍后重试</p></div>';
    });
}

// 显示我的订单列表
function displayMyOrders(orders, container) {
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>暂无订单</p></div>';
        return;
    }
    
    // 先显示订单列表，然后异步加载评价状态
    const html = orders.map(order => createOrderCard(order)).join('');
    container.innerHTML = html;
    
    // 对于已完成的订单，检查评价状态
    orders.forEach(order => {
        if (order.status === 'COMPLETED') {
            checkOrderReviewStatus(order.id).then(hasReviewed => {
                updateReviewButton(order.id, hasReviewed, order);
            }).catch(error => {
                console.error('检查评价状态失败:', error);
            });
        }
    });
}

// 创建订单卡片
function createOrderCard(order) {
    const statusClass = getOrderStatusClass(order.status);
    const statusText = getOrderStatusText(order.status);
    const orderTypeText = order.buyer.id === app.currentUser()?.id ? '购买' : '售出';
    const counterpartUser = order.buyer.id === app.currentUser()?.id ? order.seller : order.buyer;
    
    return `
        <div class="card mb-3" data-order-id="${order.id}">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center mb-2">
                            <h6 class="mb-0 me-3">订单号: ${order.orderNumber}</h6>
                            <span class="badge bg-${statusClass}">${statusText}</span>
                            <span class="badge bg-secondary ms-2">${orderTypeText}</span>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <p class="mb-1"><strong>商品:</strong> ${order.product.title}</p>
                                <p class="mb-1"><strong>${orderTypeText === '购买' ? '卖家' : '买家'}:</strong> ${counterpartUser.username}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1"><strong>金额:</strong> ${app.formatPrice(order.amount)}</p>
                                <p class="mb-1"><strong>创建时间:</strong> ${app.formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                        ${order.remark ? `<p class="mb-0"><strong>备注:</strong> ${order.remark}</p>` : ''}
                    </div>
                    <div class="col-md-4 text-md-end">
                        <div class="btn-group-vertical w-100">
                            <button type="button" class="btn btn-outline-primary btn-sm mb-2" onclick="viewOrderDetail(${order.id})">
                                <i class="fas fa-eye me-1"></i>查看详情
                            </button>
                            ${getOrderActionButton(order)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 获取订单状态样式类
function getOrderStatusClass(status) {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'PAID': return 'info';
        case 'SHIPPED': return 'primary';
        case 'COMPLETED': return 'success';
        case 'CANCELLED': return 'danger';
        case 'REFUNDED': return 'secondary';
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
        case 'REFUNDED': return '已退款';
        default: return '未知';
    }
}

// 获取订单操作按钮
function getOrderActionButton(order) {
    const isBuyer = order.buyer.id === app.currentUser()?.id;
    
    switch (order.status) {
        case 'PENDING':
            if (isBuyer) {
                return `<button type="button" class="btn btn-success btn-sm" onclick="payOrder(${order.id})">
                    <i class="fas fa-credit-card me-1"></i>支付
                </button>`;
            } else {
                return `<button type="button" class="btn btn-warning btn-sm" onclick="cancelOrder(${order.id})">
                    <i class="fas fa-times me-1"></i>取消订单
                </button>`;
            }
        case 'PAID':
            if (!isBuyer) {
                return `<button type="button" class="btn btn-primary btn-sm" onclick="shipOrder(${order.id})">
                    <i class="fas fa-truck me-1"></i>发货
                </button>`;
            }
            break;
        case 'SHIPPED':
            // 已发货状态，买家可以确认收货
            if (isBuyer) {
                return `<button type="button" class="btn btn-success btn-sm" onclick="completeOrder(${order.id})">
                    <i class="fas fa-check me-1"></i>确认收货
                </button>`;
            }
            break;
        case 'COMPLETED':
            // 已完成订单，显示评价按钮（初始状态为未评价，稍后会异步更新）
            return getReviewButton(order, false);
    }
    return '';
}

// 获取评价按钮
function getReviewButton(order, hasReviewed = false) {
    const isBuyer = order.buyer.id === app.currentUser()?.id;
    const reviewType = isBuyer ? 'BUYER_TO_SELLER' : 'SELLER_TO_BUYER';
    
    if (hasReviewed) {
        // 已评价，显示已评价按钮（禁用状态）
        return `<button type="button" class="btn btn-secondary btn-sm" disabled>
            <i class="fas fa-check-circle me-1"></i>已评价
        </button>`;
    } else {
        // 未评价，显示评价按钮
        return `<button type="button" class="btn btn-warning btn-sm" onclick="showReviewModal(${order.id}, '${reviewType}')" id="reviewBtn_${order.id}">
            <i class="fas fa-star me-1"></i>评价
        </button>`;
    }
}

// 检查订单评价状态
function checkOrderReviewStatus(orderId) {
    const token = app.authToken();
    if (!token) {
        return Promise.resolve(false);
    }
    
    return fetch(`${app.API_BASE_URL}/reviews/order/${orderId}/check`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.data; // 返回 boolean 值
        }
        return false;
    })
    .catch(error => {
        console.error('检查评价状态失败:', error);
        return false;
    });
}

// 更新评价按钮
function updateReviewButton(orderId, hasReviewed, order) {
    // 通过订单ID查找订单卡片
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!orderCard) {
        console.warn(`订单卡片未找到: ${orderId}`);
        return;
    }
    
    // 查找操作按钮容器
    const actionContainer = orderCard.querySelector('.btn-group-vertical');
    if (!actionContainer) {
        console.warn(`操作按钮容器未找到: ${orderId}`);
        return;
    }
    
    // 查找现有的评价按钮
    const existingBtn = actionContainer.querySelector(`#reviewBtn_${orderId}, button[onclick*="showReviewModal(${orderId}"]`);
    if (existingBtn) {
        // 如果已评价，替换为已评价按钮
        if (hasReviewed) {
            existingBtn.outerHTML = `<button type="button" class="btn btn-secondary btn-sm" disabled>
                <i class="fas fa-check-circle me-1"></i>已评价
            </button>`;
        }
        // 如果未评价，保持现有按钮不变
    } else {
        // 如果按钮不存在，可能需要添加
        // 这种情况不应该发生，因为按钮应该在创建订单卡片时就已经添加
        console.warn(`评价按钮未找到: ${orderId}`);
    }
}

// 查看订单详情
function viewOrderDetail(orderId) {
    fetch(`${app.API_BASE_URL}/orders/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayOrderDetailModal(data.data);
        } else {
            app.showMessage('获取订单详情失败', 'danger');
        }
    })
    .catch(error => {
        console.error('获取订单详情失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 显示订单详情模态框
function displayOrderDetailModal(order) {
    const modal = document.getElementById('orderDetailModal');
    const body = document.getElementById('orderDetailBody');
    const actionButton = document.getElementById('orderActionButton');
    
    if (!modal || !body) return;
    
    const isBuyer = order.buyer.id === app.currentUser()?.id;
    const counterpartUser = isBuyer ? order.seller : order.buyer;
    
    // 加载订单评价信息
    loadOrderReviews(order.id).then(reviews => {
        body.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>订单信息</h6>
                    <p><strong>订单号:</strong> ${order.orderNumber}</p>
                    <p><strong>状态:</strong> <span class="badge bg-${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span></p>
                    <p><strong>金额:</strong> ${app.formatPrice(order.amount)}</p>
                    <p><strong>创建时间:</strong> ${app.formatDate(order.createdAt)}</p>
                    ${order.paidAt ? `<p><strong>支付时间:</strong> ${app.formatDate(order.paidAt)}</p>` : ''}
                    ${order.completedAt ? `<p><strong>完成时间:</strong> ${app.formatDate(order.completedAt)}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h6>商品信息</h6>
                    <p><strong>商品名称:</strong> ${order.product.title}</p>
                    <p><strong>商品描述:</strong> ${order.product.description}</p>
                    <p><strong>商品价格:</strong> ${app.formatPrice(order.product.price)}</p>
                    <h6 class="mt-3">${isBuyer ? '卖家' : '买家'}信息</h6>
                    <p><strong>用户名:</strong> ${counterpartUser.username}</p>
                    <p><strong>邮箱:</strong> ${counterpartUser.email}</p>
                    ${counterpartUser.phone ? `<p><strong>电话:</strong> ${counterpartUser.phone}</p>` : ''}
                </div>
            </div>
            ${order.remark ? `<div class="mt-3"><h6>备注</h6><p>${order.remark}</p></div>` : ''}
            ${reviews && reviews.length > 0 ? `<div class="mt-3"><h6>评价信息</h6>${displayOrderReviews(reviews)}</div>` : ''}
        `;
    }).catch(error => {
        console.error('加载订单评价失败:', error);
        body.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>订单信息</h6>
                    <p><strong>订单号:</strong> ${order.orderNumber}</p>
                    <p><strong>状态:</strong> <span class="badge bg-${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span></p>
                    <p><strong>金额:</strong> ${app.formatPrice(order.amount)}</p>
                    <p><strong>创建时间:</strong> ${app.formatDate(order.createdAt)}</p>
                    ${order.paidAt ? `<p><strong>支付时间:</strong> ${app.formatDate(order.paidAt)}</p>` : ''}
                    ${order.completedAt ? `<p><strong>完成时间:</strong> ${app.formatDate(order.completedAt)}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h6>商品信息</h6>
                    <p><strong>商品名称:</strong> ${order.product.title}</p>
                    <p><strong>商品描述:</strong> ${order.product.description}</p>
                    <p><strong>商品价格:</strong> ${app.formatPrice(order.product.price)}</p>
                    <h6 class="mt-3">${isBuyer ? '卖家' : '买家'}信息</h6>
                    <p><strong>用户名:</strong> ${counterpartUser.username}</p>
                    <p><strong>邮箱:</strong> ${counterpartUser.email}</p>
                    ${counterpartUser.phone ? `<p><strong>电话:</strong> ${counterpartUser.phone}</p>` : ''}
                </div>
            </div>
            ${order.remark ? `<div class="mt-3"><h6>备注</h6><p>${order.remark}</p></div>` : ''}
        `;
    });
    
    // 设置操作按钮
    if (order.status === 'COMPLETED') {
        // 对于已完成订单，检查评价状态后再显示按钮
        checkOrderReviewStatus(order.id).then(hasReviewed => {
            const reviewButton = getReviewButton(order, hasReviewed);
            if (reviewButton) {
                actionButton.innerHTML = reviewButton;
                actionButton.style.display = 'block';
            } else {
                actionButton.style.display = 'none';
            }
        }).catch(error => {
            console.error('检查评价状态失败:', error);
            // 如果检查失败，显示默认的评价按钮
            const reviewButton = getReviewButton(order, false);
            if (reviewButton) {
                actionButton.innerHTML = reviewButton;
                actionButton.style.display = 'block';
            } else {
                actionButton.style.display = 'none';
            }
        });
    } else {
        // 对于其他状态的订单，显示相应的操作按钮
        const actionButtonHtml = getOrderActionButton(order);
        if (actionButtonHtml) {
            actionButton.innerHTML = actionButtonHtml;
            actionButton.style.display = 'block';
        } else {
            actionButton.style.display = 'none';
        }
    }
    
    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// 加载订单评价
function loadOrderReviews(orderId) {
    return fetch(`${app.API_BASE_URL}/reviews/order/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.data;
        }
        return [];
    })
    .catch(error => {
        console.error('加载订单评价失败:', error);
        return [];
    });
}

// 显示订单评价
function displayOrderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        return '<p class="text-muted">暂无评价</p>';
    }
    
    return reviews.map(review => {
        const rating = review.rating || 0;
        const stars = generateStarRating(rating);
        const typeText = review.type === 'BUYER_TO_SELLER' ? '买家评价' : '卖家评价';
        const reviewer = review.reviewer || {};
        
        return `
            <div class="border p-3 mb-2 rounded">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>${typeText} - ${reviewer.username || '未知用户'}</strong>
                    <span>${stars} ${rating} 星</span>
                </div>
                <p class="mb-0">${review.content || ''}</p>
                <small class="text-muted">${app.formatDate(review.createdAt)}</small>
            </div>
        `;
    }).join('');
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

// 支付订单
function payOrder(orderId) {
    // 显示支付二维码模态框
    showPaymentModal(orderId);
}

// 显示支付模态框
function showPaymentModal(orderId) {
    // 创建模态框HTML
    const modalHtml = `
        <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="paymentModalLabel">订单支付</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <h6>请使用微信或支付宝扫描二维码完成支付</h6>
                        </div>
                        <div class="mb-3">
                            <div id="qrCodeContainer" style="display: flex; justify-content: center; align-items: center; min-height: 200px; background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px;">
                                <div class="text-center">
                                    <i class="fas fa-qrcode fa-3x text-muted mb-2"></i>
                                    <p class="text-muted">正在生成支付二维码...</p>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <p class="text-muted small">支付完成后请点击"确认支付"按钮</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-success" onclick="confirmPayment(${orderId})">确认支付</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 移除已存在的模态框
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 生成二维码
    generateQRCode(orderId);
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

// 生成二维码
function generateQRCode(orderId) {
    const container = document.getElementById('qrCodeContainer');
    
    // 模拟生成二维码的过程
    setTimeout(() => {
        // 生成一个看起来像真实二维码的图案
        const qrCode = generateRandomQRPattern();
        container.innerHTML = `
            <div class="text-center">
                <div style="width: 200px; height: 200px; background: #fff; border: 2px solid #000; 
                           margin: 0 auto; position: relative; overflow: hidden;">
                    ${qrCode}
                </div>
                <p class="mt-2 text-muted small">请使用微信或支付宝扫描上方二维码</p>
            </div>
        `;
    }, 1000);
}

// 生成随机二维码图案
function generateRandomQRPattern() {
    const size = 25; // 25x25 的网格
    let pattern = '';
    
    // 生成随机黑白方块图案
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            // 确保四个角有定位点（真实二维码的特征）
            if ((row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)) {
                // 定位点区域 - 固定模式
                if ((row === 0 || row === 6) && (col === 0 || col === 6)) {
                    pattern += '<div style="position: absolute; width: 8px; height: 8px; background: #000; left: ' + (col * 8) + 'px; top: ' + (row * 8) + 'px;"></div>';
                } else if ((row === 1 || row === 5) && (col === 1 || col === 5)) {
                    pattern += '<div style="position: absolute; width: 6px; height: 6px; background: #000; left: ' + (col * 8 + 1) + 'px; top: ' + (row * 8 + 1) + 'px;"></div>';
                } else if (row === 3 && col === 3) {
                    pattern += '<div style="position: absolute; width: 2px; height: 2px; background: #000; left: ' + (col * 8 + 3) + 'px; top: ' + (row * 8 + 3) + 'px;"></div>';
                } else if ((row >= 0 && row <= 6 && col >= 0 && col <= 6) || 
                          (row >= 0 && row <= 6 && col >= size - 7 && col < size) || 
                          (row >= size - 7 && row < size && col >= 0 && col <= 6)) {
                    // 定位点边框
                    if (Math.random() > 0.3) {
                        pattern += '<div style="position: absolute; width: 8px; height: 8px; background: #000; left: ' + (col * 8) + 'px; top: ' + (row * 8) + 'px;"></div>';
                    }
                }
            } else {
                // 其他区域 - 随机生成
                if (Math.random() > 0.5) {
                    pattern += '<div style="position: absolute; width: 8px; height: 8px; background: #000; left: ' + (col * 8) + 'px; top: ' + (row * 8) + 'px;"></div>';
                }
            }
        }
    }
    
    return pattern;
}

// 确认支付
function confirmPayment(orderId) {
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    modal.hide();
    
    // 调用支付API
    fetch(`${app.API_BASE_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('支付成功！', 'success');
            loadMyOrders();
        } else {
            app.showMessage(data.message || '支付失败', 'danger');
        }
    })
    .catch(error => {
        console.error('支付失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 发货
function shipOrder(orderId) {
    if (!confirm('确认发货？')) return;
    
    fetch(`${app.API_BASE_URL}/orders/${orderId}/ship`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('发货成功！', 'success');
            loadMyOrders();
        } else {
            app.showMessage(data.message || '发货失败', 'danger');
        }
    })
    .catch(error => {
        console.error('发货失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 确认收货
function completeOrder(orderId) {
    if (!confirm('确认收货？')) return;
    
    fetch(`${app.API_BASE_URL}/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('确认收货成功！', 'success');
            loadMyOrders();
        } else {
            app.showMessage(data.message || '确认收货失败', 'danger');
        }
    })
    .catch(error => {
        console.error('确认收货失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 取消订单
function cancelOrder(orderId) {
    if (!confirm('确认取消此订单？')) return;
    
    fetch(`${app.API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('订单取消成功！', 'success');
            loadMyOrders();
        } else {
            app.showMessage(data.message || '取消订单失败', 'danger');
        }
    })
    .catch(error => {
        console.error('取消订单失败:', error);
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
    loadMyOrders();
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

// 显示评价模态框
function showReviewModal(orderId, reviewType) {
    const modal = document.getElementById('reviewModal');
    const form = document.getElementById('reviewForm');
    const orderIdInput = document.getElementById('reviewOrderId');
    const reviewTypeInput = document.getElementById('reviewType');
    const reviewContent = document.getElementById('reviewContent');
    const reviewContentCount = document.getElementById('reviewContentCount');
    
    if (!modal || !form) return;
    
    // 设置订单ID和评价类型
    orderIdInput.value = orderId;
    reviewTypeInput.value = reviewType;
    
    // 重置表单
    form.reset();
    reviewContentCount.textContent = '0';
    
    // 设置评价内容字数统计
    reviewContent.addEventListener('input', function() {
        reviewContentCount.textContent = this.value.length;
    });
    
    // 设置星级评分交互
    setupStarRating();
    
    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// 设置星级评分交互
function setupStarRating() {
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const starLabels = document.querySelectorAll('.star-label');
    
    ratingInputs.forEach((input, index) => {
        input.addEventListener('change', function() {
            const rating = parseInt(this.value);
            updateStarDisplay(rating);
        });
    });
    
    starLabels.forEach((label, index) => {
        label.addEventListener('mouseenter', function() {
            const rating = 5 - index;
            updateStarDisplay(rating);
        });
    });
    
    const ratingContainer = document.querySelector('.rating-input');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            const selectedRating = document.querySelector('input[name="rating"]:checked');
            if (selectedRating) {
                updateStarDisplay(parseInt(selectedRating.value));
            } else {
                updateStarDisplay(0);
            }
        });
    }
}

// 更新星级显示
function updateStarDisplay(rating) {
    const starLabels = document.querySelectorAll('.star-label i');
    starLabels.forEach((star, index) => {
        const starRating = 5 - index;
        if (starRating <= rating) {
            star.className = 'fas fa-star text-warning';
        } else {
            star.className = 'far fa-star text-warning';
        }
    });
}

// 提交评价
function submitReview() {
    const form = document.getElementById('reviewForm');
    const orderId = document.getElementById('reviewOrderId').value;
    const reviewType = document.getElementById('reviewType').value;
    const rating = document.querySelector('input[name="rating"]:checked');
    const content = document.getElementById('reviewContent').value;
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    if (!rating) {
        app.showMessage('请选择评分', 'warning');
        return;
    }
    
    if (!content.trim()) {
        app.showMessage('请输入评价内容', 'warning');
        return;
    }
    
    const token = app.authToken();
    if (!token) {
        app.showMessage('请先登录', 'warning');
        return;
    }
    
    const reviewData = {
        orderId: parseInt(orderId),
        rating: parseInt(rating.value),
        content: content.trim(),
        type: reviewType
    };
    
    fetch(`${app.API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('评价提交成功！', 'success');
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
            modal.hide();
            // 更新评价按钮状态为已评价
            updateReviewButtonAfterSubmit(parseInt(orderId));
            // 重新加载订单列表（延迟一下，确保后端更新完成）
            setTimeout(() => {
                loadMyOrders();
            }, 500);
        } else {
            app.showMessage(data.message || '评价提交失败', 'danger');
        }
    })
    .catch(error => {
        console.error('提交评价失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    });
}

// 提交评价后更新按钮状态
function updateReviewButtonAfterSubmit(orderId) {
    // 查找订单卡片
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!orderCard) return;
    
    // 查找操作按钮容器
    const actionContainer = orderCard.querySelector('.btn-group-vertical');
    if (!actionContainer) return;
    
    // 移除旧的评价按钮
    const oldBtn = actionContainer.querySelector('[id^="reviewBtn_"], button[onclick*="showReviewModal"]');
    if (oldBtn) {
        oldBtn.remove();
    }
    
    // 添加已评价按钮
    const reviewedBtn = document.createElement('button');
    reviewedBtn.type = 'button';
    reviewedBtn.className = 'btn btn-secondary btn-sm';
    reviewedBtn.disabled = true;
    reviewedBtn.innerHTML = '<i class="fas fa-check-circle me-1"></i>已评价';
    actionContainer.appendChild(reviewedBtn);
}

// 导出函数供HTML调用
window.loadMyOrders = loadMyOrders;
window.viewOrderDetail = viewOrderDetail;
window.payOrder = payOrder;
window.showPaymentModal = showPaymentModal;
window.generateQRCode = generateQRCode;
window.generateRandomQRPattern = generateRandomQRPattern;
window.confirmPayment = confirmPayment;
window.shipOrder = shipOrder;
window.completeOrder = completeOrder;
window.cancelOrder = cancelOrder;
window.goToPage = goToPage;
window.showReviewModal = showReviewModal;
window.submitReview = submitReview;
