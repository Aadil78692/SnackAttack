// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Order API functions
const OrderAPI = {
    // Create a new order
    async createOrder(orderData) {
        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // Get all orders
    async getOrders(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return await apiRequest(endpoint);
    },

    // Get specific order
    async getOrder(orderId) {
        return await apiRequest(`/orders/${orderId}`);
    },

    // Update order status
    async updateOrderStatus(orderId, status) {
        return await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
};

// Customer API functions
const CustomerAPI = {
    // Create a new customer
    async createCustomer(customerData) {
        return await apiRequest('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    },

    // Get all customers
    async getCustomers() {
        return await apiRequest('/customers');
    }
};

// Dashboard API functions
const DashboardAPI = {
    // Get dashboard statistics
    async getStats() {
        return await apiRequest('/dashboard/stats');
    }
};

// Cart management functions
const CartManager = {
    // Get cart from localStorage
    getCart() {
        const cart = localStorage.getItem('pizzaCart');
        return cart ? JSON.parse(cart) : [];
    },

    // Save cart to localStorage
    saveCart(cart) {
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
    },

    // Add item to cart
    addToCart(item) {
        const cart = this.getCart();
        const existingItem = cart.find(cartItem => cartItem.name === item.name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        this.saveCart(cart);
        this.updateCartUI();
    },

    // Remove item from cart
    removeFromCart(itemName) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.name !== itemName);
        this.saveCart(updatedCart);
        this.updateCartUI();
    },

    // Update item quantity
    updateQuantity(itemName, quantity) {
        const cart = this.getCart();
        const item = cart.find(cartItem => cartItem.name === itemName);

        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeFromCart(itemName);
                return;
            }
            this.saveCart(cart);
            this.updateCartUI();
        }
    },

    // Clear cart
    clearCart() {
        localStorage.removeItem('pizzaCart');
        this.updateCartUI();
    },

    // Calculate total
    getTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Update cart UI
    updateCartUI() {
        const cart = this.getCart();
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = '<div class="text-gray-500 italic">Your cart is empty</div>';
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div class="flex justify-between items-center py-2 border-b">
                        <div>
                            <h4 class="font-medium">${item.name}</h4>
                            <p class="text-sm text-gray-600">₹${item.price} × ${item.quantity}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="CartManager.updateQuantity('${item.name}', ${item.quantity - 1})" class="text-red-500">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="CartManager.updateQuantity('${item.name}', ${item.quantity + 1})" class="text-green-500">+</button>
                            <button onclick="CartManager.removeFromCart('${item.name}')" class="text-red-500 ml-2">Remove</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            cartTotal.textContent = `₹${this.getTotal()}`;
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = cart.length === 0;
        }
    }
};

// Order form handling
function setupOrderForm() {
    const orderForm = document.querySelector('form');
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');

    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cart = CartManager.getCart();
            if (cart.length === 0) {
                showMessage('Please add items to your cart before placing an order.', 'error');
                return;
            }

            const formData = new FormData(orderForm);
            const orderData = {
                customer_name: formData.get('name'),
                customer_phone: formData.get('phone'),
                customer_email: formData.get('email') || '',
                customer_address: formData.get('address'),
                items: cart,
                payment_method: formData.get('payment'),
                total_amount: CartManager.getTotal()
            };

            try {
                // Show loading state
                orderForm.classList.add('loading');

                const response = await OrderAPI.createOrder(orderData);

                // Clear cart and form
                CartManager.clearCart();
                orderForm.reset();

                // Show success message
                showMessage('Order placed successfully! Order ID: ' + response.order.id, 'success');

                // Hide messages after 5 seconds
                setTimeout(() => {
                    hideMessages();
                }, 5000);

            } catch (error) {
                showMessage('Failed to place order: ' + error.message, 'error');
            } finally {
                orderForm.classList.remove('loading');
            }
        });
    }
}

// Message display functions
function showMessage(message, type) {
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');

    if (type === 'success' && successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    } else if (type === 'error' && errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }
}

function hideMessages() {
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');

    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update cart UI on page load
    CartManager.updateCartUI();

    // Setup order form
    setupOrderForm();

    // Add click handlers for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));

            CartManager.addToCart({ name, price });
        });
    });
});

// Export for use in other scripts
window.OrderAPI = OrderAPI;
window.CustomerAPI = CustomerAPI;
window.DashboardAPI = DashboardAPI;
window.CartManager = CartManager;
