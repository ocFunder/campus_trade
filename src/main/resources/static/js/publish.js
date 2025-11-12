// 发布商品页面相关功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待用户认证完成
    waitForUserAuth();
    
    // 设置表单事件监听器
    setupFormEventListeners();
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
        app.showMessage('请先登录后再发布商品', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// 初始化页面
function initializePage() {
    // 设置表单验证
    setupFormValidation();
    
    // 设置图片预览
    setupImagePreview();
    
    // 设置字符计数
    setupCharacterCount();
}

// 设置表单事件监听器
function setupFormEventListeners() {
    const form = document.getElementById('publishForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// 设置表单验证
function setupFormValidation() {
    const form = document.getElementById('publishForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// 设置图片预览
function setupImagePreview() {
    const imageInput = document.getElementById('images');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

// 设置字符计数
function setupCharacterCount() {
    const description = document.getElementById('description');
    const counter = document.getElementById('descCount');
    
    if (description && counter) {
        description.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = length;
            
            if (length > 1000) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        });
    }
}

// 处理图片预览
function handleImagePreview(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    
    if (files.length === 0) {
        imagePreview.style.display = 'none';
        return;
    }
    
    // 限制图片数量
    if (files.length > 5) {
        app.showMessage('最多只能上传5张图片', 'warning');
        event.target.value = '';
        return;
    }
    
    // 清空之前的预览
    previewContainer.innerHTML = '';
    
    // 预览每张图片
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const col = document.createElement('div');
                col.className = 'col-md-4 mb-3';
                col.innerHTML = `
                    <div class="card">
                        <img src="${e.target.result}" class="card-img-top" style="height: 150px; object-fit: cover;">
                        <div class="card-body p-2">
                            <small class="text-muted">图片 ${index + 1}</small>
                        </div>
                    </div>
                `;
                previewContainer.appendChild(col);
            };
            reader.readAsDataURL(file);
        }
    });
    
    imagePreview.style.display = 'block';
}

// 验证单个字段
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // 清除之前的错误状态
    clearFieldError(event);
    
    // 验证必填字段
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, '此字段为必填项');
        return false;
    }
    
    // 验证特定字段
    switch (field.id) {
        case 'title':
            if (value.length < 2) {
                showFieldError(field, '商品标题至少需要2个字符');
                return false;
            }
            break;
        case 'price':
            const price = parseFloat(value);
            if (isNaN(price) || price <= 0) {
                showFieldError(field, '请输入有效的价格');
                return false;
            }
            if (price > 999999.99) {
                showFieldError(field, '价格不能超过999,999.99元');
                return false;
            }
            break;
        case 'description':
            if (value.length < 10) {
                showFieldError(field, '商品描述至少需要10个字符');
                return false;
            }
            break;
        case 'phone':
            if (value && !/^1[3-9]\d{9}$/.test(value)) {
                showFieldError(field, '请输入有效的手机号码');
                return false;
            }
            break;
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                showFieldError(field, '请输入有效的邮箱地址');
                return false;
            }
            break;
    }
    
    return true;
}

// 显示字段错误
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    // 移除之前的错误消息
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // 添加新的错误消息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// 清除字段错误
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// 处理表单提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    // 验证所有字段
    const form = document.getElementById('publishForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        app.showMessage('请检查并修正表单中的错误', 'danger');
        return;
    }
    
    // 提交表单
    submitProduct();
}

// 提交商品
function submitProduct() {
    const form = document.getElementById('publishForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // 禁用提交按钮
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>发布中...';
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('category', document.getElementById('category').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value.trim());
    
    // 添加图片
    const imageInput = document.getElementById('images');
    if (imageInput.files.length > 0) {
        Array.from(imageInput.files).forEach((file, index) => {
            formData.append('images', file);
        });
    }
    
    // 发送请求
    fetch(`${app.API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${app.authToken()}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            app.showMessage('商品发布成功！', 'success');
            setTimeout(() => {
                window.location.href = 'my-products.html';
            }, 2000);
        } else {
            app.showMessage(data.message || '商品发布失败', 'danger');
        }
    })
    .catch(error => {
        console.error('发布商品失败:', error);
        app.showMessage('网络错误，请稍后重试', 'danger');
    })
    .finally(() => {
        // 恢复提交按钮
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>发布商品';
    });
}

// 重置表单
function resetForm() {
    if (confirm('确定要重置表单吗？所有输入的内容将被清空。')) {
        const form = document.getElementById('publishForm');
        form.reset();
        
        // 清除所有错误状态
        const inputs = form.querySelectorAll('.is-invalid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const errorDiv = input.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
        
        // 隐藏图片预览
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.style.display = 'none';
        
        // 重置字符计数
        const counter = document.getElementById('descCount');
        if (counter) {
            counter.textContent = '0';
            counter.classList.remove('text-danger');
        }
        
        app.showMessage('表单已重置', 'info');
    }
}

// 导出函数供HTML调用
window.resetForm = resetForm;
