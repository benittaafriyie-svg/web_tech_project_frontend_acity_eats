// API_URL is declared in auth.js (loaded before this script)
let cart = [];

// Load Cart from LocalStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        displayCart();
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add Item to Cart
function addToCart(item, quantity = 1) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantity
        });
    }
    
    saveCart();
    displayCart();
}

// Remove Item from Cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    displayCart();
}

// Update Item Quantity
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            displayCart();
        }
    }
}

// Display Cart
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 0; color: #999;">
                <p>Your cart is empty</p>
                <p style="font-size: 14px; margin-top: 10px;">Add items to get started!</p>
            </div>
        `;
        subtotalElement.textContent = 'GHS 0';
        totalElement.textContent = 'GHS 0';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemHTML = `
            <div class="cart-item">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">GHS ${item.price}</div>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        
        cartItemsContainer.innerHTML += cartItemHTML;
    });
    
    const discount = 0;
    const total = subtotal - discount;
    
    subtotalElement.textContent = `GHS ${subtotal.toLocaleString()}`;
    document.getElementById('discount').textContent = discount;
    totalElement.textContent = `GHS ${total.toLocaleString()}`;
}

// Proceed to Checkout
async function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to place an order');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const orderItems = cart.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price
        }));
        
        // Get order type from global variable (defaults to 'Inhouse' if not set)
        const currentOrderType = window.orderType || 'Inhouse';
        
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                items: orderItems,
                order_type: currentOrderType
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Order placed successfully! Order ID: ${data.order_id}`);
            cart = [];
            saveCart();
            displayCart();
            window.location.href = 'orders.html';
        } else {
            alert(data.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Clear Cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        displayCart();
    }
}

// Get Cart Item Count
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get Cart Total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}