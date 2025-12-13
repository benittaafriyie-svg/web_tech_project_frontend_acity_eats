// API Configuration
const API_CONFIG = {
    // Base URL for your backend API (Express server in /backend)
    // For local development the server runs on port 5000 by default.
    BASE_URL: 'https://web-tech-project-backend-acity-eats.onrender.com/api',
    TIMEOUT: 10000
};

// API Helper Functions
const API = {
    // Generic API Call
    async call(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    },
    
    // GET Request
    async get(endpoint) {
        return this.call(endpoint, { method: 'GET' });
    },
    
    // POST Request
    async post(endpoint, data) {
        return this.call(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT Request
    async put(endpoint, data) {
        return this.call(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE Request
    async delete(endpoint) {
        return this.call(endpoint, { method: 'DELETE' });
    }
};

// Auth API
const AuthAPI = {
    async register(userData) {
        return API.post('/auth/register', userData);
    },
    
    async login(credentials) {
        return API.post('/auth/login', credentials);
    },
    
    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    async getProfile() {
        return API.get('/auth/profile');
    }
};

// Menu API
const MenuAPI = {
    async getAll() {
        return API.get('/menu');
    },
    
    async getById(id) {
        return API.get(`/menu/${id}`);
    },
    
    async getByCategory(category) {
        return API.get(`/menu/category/${category}`);
    }
};

// Orders API
const OrdersAPI = {
    async create(orderData) {
        return API.post('/orders', orderData);
    },
    
    async getUserOrders() {
        return API.get('/orders');
    },
    
    async getById(id) {
        return API.get(`/orders/${id}`);
    },
    
    async getStatus(id) {
        return API.get(`/orders/${id}/status`);
    }
};

// Admin API
const AdminAPI = {
    async getAllOrders() {
        return API.get('/admin/orders');
    },
    
    async updateOrderStatus(orderId, status) {
        return API.put(`/admin/orders/${orderId}/status`, { status });
    },
    
    async addMenuItem(itemData) {
        return API.post('/admin/menu', itemData);
    },
    
    async updateMenuItem(itemId, itemData) {
        return API.put(`/admin/menu/${itemId}`, itemData);
    },
    
    async deleteMenuItem(itemId) {
        return API.delete(`/admin/menu/${itemId}`);
    },
    
    async getStats() {
        return API.get('/admin/stats');
    }
};

// Error Handler
function handleAPIError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('timeout')) {
        alert('Request timeout. Please check your connection.');
    } else if (error.message.includes('unauthorized')) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
    } else {
        alert(error.message || 'An error occurred. Please try again.');
    }
}

// Loading Indicator
function showLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);