document.addEventListener('DOMContentLoaded', function() {
    const cart = [];
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const clearCartBtn = document.getElementById('clear-cart');
    const orderForm = document.getElementById('order-form');
    const orderSummary = document.getElementById('order-summary');
    const summaryContent = document.getElementById('summary-content');
    const newOrderBtn = document.getElementById('new-order');

    // Add loading animation to buttons
    function showLoading(button, text = 'Processing...') {
        const originalText = button.textContent;
        button.textContent = text;
        button.disabled = true;
        button.style.opacity = '0.7';
        return originalText;
    }

    function hideLoading(button, text) {
        button.textContent = text;
        button.disabled = false;
        button.style.opacity = '1';
    }

    // Add to cart functionality with animation
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));

            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            addToCart(name, price);

            // Show notification
            showNotification(`Added ${name} to cart!`, 'success');
        });
    });

    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        updateCart();
    }

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #666; font-style: italic; padding: 2rem;">Your cart is empty</p>';
            return;
        }

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.style.animation = `slideInFromLeft 0.5s ease-out ${index * 0.1}s both`;
            cartItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: #333;">${item.name}</span>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button onclick="updateQuantity('${item.name}', -1)" style="background: #ff6b6b; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">-</button>
                                <span style="font-weight: 500; min-width: 20px; text-align: center;">${item.quantity}</span>
                                <button onclick="updateQuantity('${item.name}', 1)" style="background: #4CAF50; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">+</button>
                            </div>
                            <span style="color: #666; font-size: 0.9rem;">₹${item.price} each</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 600; color: #ff6b6b;">₹${itemTotal}</span>
                        <button onclick="removeFromCart('${item.name}')" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; margin-left: 0.5rem; font-size: 0.8rem;">×</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        totalAmount.textContent = total;
    }

    // Global functions for cart operations
    window.updateQuantity = function(name, change) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(name);
            } else {
                updateCart();
                showNotification(`Updated ${name} quantity`, 'info');
            }
        }
    };

    window.removeFromCart = function(name) {
        const index = cart.findIndex(item => item.name === name);
        if (index > -1) {
            cart.splice(index, 1);
            updateCart();
            showNotification(`Removed ${name} from cart`, 'warning');
        }
    };

    clearCartBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Cart is already empty!', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear your cart?')) {
            cart.length = 0;
            updateCart();
            showNotification('Cart cleared successfully!', 'success');
        }
    });

    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (cart.length === 0) {
            showNotification('Please add some items to your cart first!', 'warning');
            return;
        }

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();

        if (!name || !phone || !address) {
            showNotification('Please fill in all customer details!', 'warning');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = showLoading(submitBtn, 'Placing Order...');

        // Store customer details (send to server)
        const customerData = {
            customer_name: name,
            phone: phone,
            address: address,
            items: cart,
            total: totalAmount.textContent
        };

        console.log('Sending order:', customerData);

        fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Order saved:', data);
            hideLoading(submitBtn, 'Order Placed!');

            // Show success message
            showNotification('Order placed successfully! Redirecting...', 'success');

            // Redirect to success page after a short delay
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 1500);
        })
        .catch(error => {
            console.error('Error saving order:', error);
            hideLoading(submitBtn, 'Place Order');
            showNotification('Error placing order: ' + error.message, 'error');
        });
    });

    function displayOrderSummary(data) {
        let itemsHtml = '<h3>Order Details:</h3>';
        data.order.forEach(item => {
            itemsHtml += `<p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>`;
        });
        itemsHtml += `<p><strong>Total: ₹${data.total}</strong></p>`;
        itemsHtml += `<h3>Customer Information:</h3>`;
        itemsHtml += `<p>Name: ${data.name}</p>`;
        itemsHtml += `<p>Phone: ${data.phone}</p>`;
        itemsHtml += `<p>Address: ${data.address}</p>`;
        summaryContent.innerHTML = itemsHtml;
    }

    newOrderBtn.addEventListener('click', function() {
        cart.length = 0;
        updateCart();
        orderForm.reset();
        orderSummary.style.display = 'none';
        document.getElementById('customer-details').style.display = 'block';
        showNotification('Ready for new order!', 'info');
    });

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInFromRight 0.5s ease-out;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            max-width: 300px;
            word-wrap: break-word;
        `;

        const colors = {
            success: 'linear-gradient(45deg, #4CAF50, #45a049)',
            error: 'linear-gradient(45deg, #f44336, #d32f2f)',
            warning: 'linear-gradient(45deg, #ff9800, #f57c00)',
            info: 'linear-gradient(45deg, #2196F3, #1976d2)'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInFromLeft {
            from {
                opacity: 0;
                transform: translateX(-100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInFromRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOutToRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
});
