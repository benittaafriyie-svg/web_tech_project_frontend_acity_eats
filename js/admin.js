// API_URL is declared in auth.js (loaded before this script)
let adminOrders = [];

// Load Admin Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    checkAdminAccess();
    await loadAdminData();
});

// Check Admin Access
function checkAdminAccess() {
    const user = getCurrentUser();
    if (!user || !user.is_admin) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
    }
}

// Filter Admin Orders by Type (All / Inhouse / Takeout)
function filterAdminOrders(type, evt) {
    if (!adminOrders || adminOrders.length === 0) {
        return;
    }

    // Toggle active state on filter buttons
    const filterButtons = document.querySelectorAll('#adminOrderFilters .tab');
    filterButtons.forEach(btn => btn.classList.remove('active'));

    const target = evt && evt.target ? evt.target : event.target;
    if (target) {
        target.classList.add('active');
    }

    let filtered = adminOrders;
    if (type !== 'All') {
        filtered = adminOrders.filter(o => (o.order_type || 'Inhouse') === type);
    }

    displayAdminOrders(filtered);
}

// Load Admin Dashboard Data
async function loadAdminData() {
    await Promise.all([
        loadStats(),
        loadAllOrders(),
        loadMenuItems()
    ]);
}

// Load Statistics
async function loadStats() {
    try {
        const ordersResponse = await fetch(`${API_URL}/admin/orders`, {
            headers: getAuthHeaders()
        });
        
        if (ordersResponse.ok) {
            const orders = await ordersResponse.json();
            
            const totalOrders = orders.length;
            const pendingOrders = orders.filter(o => o.status === 'Pending').length;
            const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

            // Order type breakdown (defaults to Inhouse if not provided)
            const inhouseOrders = orders.filter(o => (o.order_type || 'Inhouse') === 'Inhouse').length;
            const takeoutOrders = orders.filter(o => (o.order_type || 'Inhouse') === 'Takeout').length;
            
            document.getElementById('totalOrders').textContent = totalOrders;
            document.getElementById('pendingOrders').textContent = pendingOrders;
            document.getElementById('totalRevenue').textContent = `GHS ${totalRevenue.toLocaleString()}`;

            const inhouseEl = document.getElementById('inhouseOrders');
            const takeoutEl = document.getElementById('takeoutOrders');
            if (inhouseEl && takeoutEl) {
                inhouseEl.textContent = inhouseOrders;
                takeoutEl.textContent = takeoutOrders;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load All Orders
async function loadAllOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok) {
            adminOrders = data;
            displayAdminOrders(adminOrders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display Admin Orders
function displayAdminOrders(orders) {
    const ordersContainer = document.getElementById('adminOrdersContainer');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No orders yet</div>';
        return;
    }
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleString();
        const statusClass = `status-${order.status.toLowerCase()}`;
        const orderType = order.order_type || 'Inhouse';
        
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
                        <div style="font-size: 12px; color: #999; margin-top: 5px;">
                            ${orderDate} - ${order.user_name || 'Unknown User'}
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 3px;">
                            Type: ${orderType}${order.room_number ? ` • Room: ${order.room_number}` : ''}
                        </div>
                    </div>
                    <select class="order-status ${statusClass}" 
                            onchange="updateOrderStatus(${order.id}, this.value)"
                            style="border: none; cursor: pointer; padding: 6px 15px;">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="order-items">
                    ${orderItemsHTML}
                </div>
                <div class="order-total">
                    <span>Total</span>
                    <span>GHS ${order.total_amount.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        ordersContainer.innerHTML += orderCard;
    });
}

// Update Order Status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Order status updated successfully!');
            await loadAdminData();
        } else {
            alert(data.error || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update status');
    }
}

// Load Menu Items for Management
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        const data = await response.json();
        
        if (response.ok) {
            displayMenuManagement(data);
        }
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

// Display Menu Management
function displayMenuManagement(items) {
    const menuContainer = document.getElementById('menuManagement');
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '<h3>Menu Management</h3>';
    
    items.forEach(item => {
        const itemCard = `
            <div class="order-card" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div class="order-id">${item.name}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                        GHS ${item.price} - ${item.category}
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="form-btn" style="padding: 8px 15px;" onclick="editMenuItem(${item.id})">
                        Edit
                    </button>
                    <button class="form-btn" style="padding: 8px 15px; background: var(--danger-color);" 
                            onclick="deleteMenuItem(${item.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
        
        menuContainer.innerHTML += itemCard;
    });
    
    // Add New Item Button
    menuContainer.innerHTML += `
        <button class="checkout-btn" onclick="showAddMenuItemForm()" style="margin-top: 20px;">
            + Add New Menu Item
        </button>
    `;
}

// Show Add Menu Item Form
function showAddMenuItemForm() {
    const modal = document.getElementById('menuItemModal');
    const modalContent = document.getElementById('menuItemForm');
    
    modalContent.innerHTML = `
        <button class="close-modal" onclick="closeMenuModal()">✕</button>
        <h2 style="margin-bottom: 20px; color: var(--dark-color);">Add New Menu Item</h2>
        <form onsubmit="saveMenuItem(event, null)">
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Item Name</label>
                <input type="text" class="form-input" id="itemName" required style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
            </div>
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Price (GHS)</label>
                <input type="number" class="form-input" id="itemPrice" step="0.01" required style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
            </div>
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Original Price (GHS) - Optional</label>
                <input type="number" class="form-input" id="itemOriginalPrice" step="0.01" style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
            </div>
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Category</label>
                <select class="form-input" id="itemCategory" required style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
                    <option value="Meals">Meals</option>
                    <option value="Noodles">Noodles</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Burger">Burger</option>
                    <option value="Drinks">Drinks</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Description</label>
                <textarea class="form-input" id="itemDescription" rows="3" style="background: white; color: var(--dark-color); border: 1px solid #ddd;"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Image URL</label>
                <input type="url" class="form-input" id="itemImage" style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
            </div>
            <div class="form-group">
                <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">
                    <input type="checkbox" id="itemAvailable" checked style="margin-right: 8px;">
                    Available
                </label>
            </div>
            <button type="submit" class="form-btn">Save Menu Item</button>
        </form>
    `;
    
    modal.classList.add('active');
}

// Save Menu Item (create or update)
async function saveMenuItem(event, itemId = null) {
    event.preventDefault();
    
    const itemData = {
        name: document.getElementById('itemName').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDescription').value,
        image_url: document.getElementById('itemImage').value,
        available: document.getElementById('itemAvailable').checked
    };
    
    // Add original_price if provided
    const originalPrice = document.getElementById('itemOriginalPrice').value;
    if (originalPrice) {
        itemData.original_price = parseFloat(originalPrice);
    }
    
    try {
        const url = itemId 
            ? `${API_URL}/admin/menu/${itemId}`
            : `${API_URL}/admin/menu`;
        const method = itemId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(itemData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(itemId ? 'Menu item updated successfully!' : 'Menu item added successfully!');
            closeMenuModal();
            await loadMenuItems();
        } else {
            alert(data.error || (itemId ? 'Failed to update menu item' : 'Failed to add menu item'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert(itemId ? 'Failed to update menu item' : 'Failed to add menu item');
    }
}

// Close Menu Modal
function closeMenuModal() {
    document.getElementById('menuItemModal').classList.remove('active');
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Edit Menu Item
async function editMenuItem(itemId) {
    try {
        // Fetch the menu item data
        const response = await fetch(`${API_URL}/menu/${itemId}`);
        const item = await response.json();
        
        if (!response.ok) {
            alert('Failed to load menu item details');
            return;
        }
        
        // Show edit form with pre-filled data
        const modal = document.getElementById('menuItemModal');
        const modalContent = document.getElementById('menuItemForm');
        
        // Escape values to prevent XSS
        const name = escapeHtml(item.name || '');
        const price = item.price || '';
        const originalPrice = item.original_price || '';
        const description = escapeHtml(item.description || '');
        const imageUrl = escapeHtml(item.image_url || '');
        const category = item.category || 'Meals';
        const available = item.available !== false;
        
        modalContent.innerHTML = `
            <button class="close-modal" onclick="closeMenuModal()">✕</button>
            <h2 style="margin-bottom: 20px; color: var(--dark-color);">Edit Menu Item</h2>
            <form onsubmit="saveMenuItem(event, ${itemId})">
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Item Name</label>
                    <input type="text" class="form-input" id="itemName" value="${name}" required style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Price (GHS)</label>
                    <input type="number" class="form-input" id="itemPrice" step="0.01" value="${price}" required style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Original Price (GHS) - Optional</label>
                    <input type="number" class="form-input" id="itemOriginalPrice" step="0.01" value="${originalPrice}" style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Category</label>
                    <select class="form-input" id="itemCategory" required style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
                        <option value="Meals" ${category === 'Meals' ? 'selected' : ''}>Meals</option>
                        <option value="Noodles" ${category === 'Noodles' ? 'selected' : ''}>Noodles</option>
                        <option value="Sandwich" ${category === 'Sandwich' ? 'selected' : ''}>Sandwich</option>
                        <option value="Burger" ${category === 'Burger' ? 'selected' : ''}>Burger</option>
                        <option value="Drinks" ${category === 'Drinks' ? 'selected' : ''}>Drinks</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Description</label>
                    <textarea class="form-input" id="itemDescription" rows="3" style="background: white; color: var(--dark-color); border: 1px solid #ddd;">${description}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">Image URL</label>
                    <input type="url" class="form-input" id="itemImage" value="${imageUrl}" style="background: white; color: var(--dark-color); border: 1px solid #ddd;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color: var(--dark-color); display: block; margin-bottom: 8px; font-weight: 500;">
                        <input type="checkbox" id="itemAvailable" ${available ? 'checked' : ''} style="margin-right: 8px;">
                        Available
                    </label>
                </div>
                <button type="submit" class="form-btn">Update Menu Item</button>
            </form>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading menu item:', error);
        alert('Failed to load menu item details');
    }
}

// Delete Menu Item
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/menu/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            alert('Menu item deleted successfully!');
            await loadMenuItems();
        } else {
            alert('Failed to delete menu item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete menu item');
    }
}