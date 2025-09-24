document.addEventListener('DOMContentLoaded', function() {
    const cart = [];
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const clearCartBtn = document.getElementById('clear-cart');
    const orderForm = document.getElementById('order-form');
    const orderSummary = document.getElementById('order-summary');
    const summaryContent = document.getElementById('summary-content');
    const newOrderBtn = document.getElementById('new-order');

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            addToCart(name, price);
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
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>₹${itemTotal}</span>
            `;
            cartItems.appendChild(cartItem);
        });
        totalAmount.textContent = total;
    }

    clearCartBtn.addEventListener('click', function() {
        cart.length = 0;
        updateCart();
    });

    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        // Store customer details (send to server)
        const customerData = { customer_name: name, items: cart, total: totalAmount.textContent };
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
            return response.json();
        })
        .then(data => {
            console.log('Order saved:', data);
            // Redirect to success page
            window.location.href = 'success.html';
        })
        .catch(error => {
            console.error('Error saving order:', error);
            alert('Error saving order: ' + error.message);
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
    });
});
