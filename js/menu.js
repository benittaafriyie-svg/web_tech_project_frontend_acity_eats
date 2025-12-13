// API_URL is declared in auth.js (loaded before this script)
let menuItems = [];
let filteredItems = [];
let selectedCategory = 'All';
let orderType = 'Inhouse'; // 'Inhouse' or 'Delivery'
window.orderType = orderType; // Make it globally accessible

// Load Menu on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth but don't block menu loading if check fails
    try {
        checkAuth();
    } catch (error) {
        console.warn('Auth check failed:', error);
    }
    
    loadUserProfile();
    await loadMenu();
    loadCart();
});

// Set Order Type (Inhouse vs Delivery)
function setOrderType(type, evt) {
    orderType = type;
    window.orderType = type; // Update global reference

    // Toggle active tab styling
    const tabs = document.querySelectorAll('.nav-tabs .tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const target = evt && evt.target ? evt.target : event.target;
    if (target) {
        target.classList.add('active');
    }
}

// Load User Profile
function loadUserProfile() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }
}

// Load Menu Items
async function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const popularGrid = document.getElementById('popularGrid');
    
    // Show loading state
    if (menuGrid) {
        menuGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Loading menu...</div>';
    }
    
    try {
        const response = await fetch(`${API_URL}/menu`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            console.log('Menu loaded successfully:', data.length, 'items');
            menuItems = data;
            filteredItems = data;
            displayMenu(filteredItems);
            displayPopularItems(data);
        } else {
            console.error('Error loading menu: Invalid response format', data);
            if (menuGrid) {
                menuGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Failed to load menu items. Please refresh the page.</div>';
            }
            if (popularGrid) {
                popularGrid.innerHTML = '';
            }
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        // Show error message
        if (menuGrid) {
            menuGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Failed to load menu items. Please check your connection and refresh the page.<br><small>' + error.message + '</small></div>';
        }
        if (popularGrid) {
            popularGrid.innerHTML = '';
        }
    }
}

// Display Menu Items
function displayMenu(items) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) {
        console.error('menuGrid element not found');
        return;
    }
    
    menuGrid.innerHTML = '';
    
    if (!items || items.length === 0) {
        console.log('No menu items to display');
        menuGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No menu items available</div>';
        return;
    }
    
    console.log('Displaying', items.length, 'menu items');
    items.forEach(item => {
        const discount = item.original_price ? 
            Math.round((1 - item.price / item.original_price) * 100) : 0;
        
        const itemCard = `
            <div class="menu-item" onclick="showItemDetails(${item.id})">
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${item.id})">
                    ♡
                </button>
                <img src="${item.image_url || 'https://via.placeholder.com/200'}" 
                     alt="${item.name}" class="menu-item-image">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-price">
                        <div>
                            <span class="price">GHS ${item.price}</span>
                            ${item.original_price ? 
                                `<span class="original-price">GHS ${item.original_price}</span>` 
                                : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        menuGrid.innerHTML += itemCard;
    });
}

// Display Popular Items
function displayPopularItems(items) {
    if (!items || items.length === 0) {
        const popularGrid = document.getElementById('popularGrid');
        if (popularGrid) {
            popularGrid.innerHTML = '';
        }
        return;
    }
    
    const popularItems = items.slice(0, 3);
    const popularGrid = document.getElementById('popularGrid');
    if (!popularGrid) {
        console.error('popularGrid element not found');
        return;
    }
    
    popularGrid.innerHTML = '';
    
    popularItems.forEach(item => {
        const itemCard = `
            <div class="menu-item" onclick="showItemDetails(${item.id})">
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${item.id})">
                    ♡
                </button>
                <img src="${item.image_url || 'https://via.placeholder.com/200'}" 
                     alt="${item.name}" class="menu-item-image">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-price">
                        <span class="price">GHS ${item.price}</span>
                    </div>
                </div>
            </div>
        `;
        
        popularGrid.innerHTML += itemCard;
    });
}

// Filter by Category
function filterByCategory(category, evt) {
    selectedCategory = category;

    // Update active state on category pills
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });

    const target = evt && evt.target ? evt.target : event.target;
    if (target) {
        const wrapper = target.closest('.category-item');
        if (wrapper) wrapper.classList.add('active');
    }

    if (category === 'All') {
        filteredItems = menuItems;
    } else if (category === 'Drinks') {
        filteredItems = menuItems.filter(item => item.category === 'Drinks');
    } else if (category === 'Meals') {
        // Map "Meals" to all main food categories from the backend
        const mealCategories = ['Meals', 'Noodles', 'Sandwich', 'Burger'];
        filteredItems = menuItems.filter(item => mealCategories.includes(item.category));
    } else if (category === 'Snacks') {
        // Map "Snacks" to lighter items
        const snackCategories = ['Burger', 'Sandwich'];
        filteredItems = menuItems.filter(item => snackCategories.includes(item.category));
    } else {
        // Fallback: direct match
        filteredItems = menuItems.filter(item => item.category === category);
    }

    displayMenu(filteredItems);
}

// Show Item Details Modal
function showItemDetails(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const modal = document.getElementById('itemModal');
    const modalContent = document.getElementById('modalItemDetails');
    
    modalContent.innerHTML = `
        <button class="close-modal" onclick="closeModal()">✕</button>
        <div style="text-align: center;">
            <img src="${item.image_url || 'https://via.placeholder.com/400'}" 
                 alt="${item.name}" 
                 style="width: 100%; max-width: 400px; border-radius: 16px; margin-bottom: 20px;">
            <h2 style="margin-bottom: 10px;">${item.name}</h2>
            <div style="margin-bottom: 20px;">
                <span class="price" style="font-size: 24px;">GHS ${item.price}</span>
                ${item.original_price ? 
                    `<span class="original-price" style="font-size: 18px;">GHS ${item.original_price}</span>` 
                    : ''}
            </div>
            <div style="color: #666; margin-bottom: 20px;">
                ${item.description || 'Delicious food item from our cafeteria.'}
            </div>
            <div class="quantity-control" style="justify-content: center; margin-bottom: 20px;">
                <button class="qty-btn" onclick="decrementQuantity()">-</button>
                <span class="quantity" id="modalQuantity">1</span>
                <button class="qty-btn" onclick="incrementQuantity()">+</button>
            </div>
            <button class="checkout-btn" onclick="addToCartFromModal(${item.id})">
                Add to Cart - GHS ${item.price}
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Modal Quantity Controls
let modalQuantity = 1;

function incrementQuantity() {
    modalQuantity++;
    document.getElementById('modalQuantity').textContent = modalQuantity;
}

function decrementQuantity() {
    if (modalQuantity > 1) {
        modalQuantity--;
        document.getElementById('modalQuantity').textContent = modalQuantity;
    }
}

// Close Modal
function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    modalQuantity = 1;
}

// Add to Cart from Modal
function addToCartFromModal(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    addToCart(item, modalQuantity);
    closeModal();
}

// Toggle Favorite
function toggleFavorite(itemId) {
    const btn = event.target;
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
}