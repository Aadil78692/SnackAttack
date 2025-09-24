const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper function to read orders from JSON file
function readOrders() {
    try {
        if (fs.existsSync('orders.json')) {
            const data = fs.readFileSync('orders.json', 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error reading orders:', error);
        return [];
    }
}

// Helper function to write orders to JSON file
function writeOrders(orders) {
    try {
        fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));
    } catch (error) {
        console.error('Error writing orders:', error);
        throw error;
    }
}

// API to get all orders
app.get('/api/orders', (req, res) => {
    const orders = readOrders();
    res.json(orders);
});

// API to add a new order
app.post('/api/orders', (req, res) => {
    const { customer_name, items, total } = req.body;

    try {
        const orders = readOrders();
        const newOrder = {
            id: Date.now(), // Simple ID generation
            customer_name,
            items,
            total,
            timestamp: new Date().toISOString()
        };

        orders.push(newOrder);
        writeOrders(orders);

        res.json({ message: 'Order saved successfully', id: newOrder.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
