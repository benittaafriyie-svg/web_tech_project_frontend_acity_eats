// API_URL is declared in auth.js (loaded before this script)
// Load Orders on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadOrders();
});

// Load User Orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayOrders(data);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display Orders
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🍽️</div>
                <h3 style="color: var(--dark-color); margin-bottom: 10px;">No Orders Yet</h3>
                <p style="color: #999;">Start ordering delicious meals from our cafeteria!</p>
                <a href="index.html" class="checkout-btn" style="display: inline-block; margin-top: 20px; text-decoration: none;">
                    Browse Menu
                </a>
            </div>
        `;
        return;
    }
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleString();
        const statusClass = `status-${order.status.toLowerCase()}`;
        
        let orderItemsHTML = '';
        if (order.items && order.items.length > 0) {
            orderItemsHTML = order.items.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>GHS ${item.price * item.quantity}</span>
                </div>
            `).join('');
        }
        
        const orderCard = `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.id}</div>
                        <div style="font-size: 12px; color: #999; margin-top: 5px;">${orderDate}</div>
                    </div>
                    <div class="order-status ${statusClass}">${order.status}</div>
                </div>
                <div class="order-items">
                    ${orderItemsHTML || '<div style="color: #999;">No items</div>'}
                </div>
                <div class="order-total">
                    <span>Total</span>
                    <span>GHS ${order.total_amount.toLocaleString()}</span>
                </div>
                ${order.status !== 'Completed' && order.status !== 'Cancelled' ? `
                    <button class="form-btn" style="margin-top: 15px; padding: 10px;" 
                            onclick="trackOrder(${order.id})">
                        Track Order
                    </button>
                ` : ''}
            </div>
        `;
        
        ordersContainer.innerHTML += orderCard;
    });
}

// Track Order (Show detailed status)
function trackOrder(orderId) {
    alert(`Tracking Order #${orderId}\n\nYour order is being prepared. You'll be notified when it's ready for pickup!`);
}

// Refresh Orders
async function refreshOrders() {
    await loadOrders();
}

// Filter Orders by Status
function filterOrders(status) {
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
        const orderStatus = card.querySelector('.order-status');
        if (status === 'All' || orderStatus.textContent === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}