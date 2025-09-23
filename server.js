const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your actual MySQL password
    database: 'snackattack_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API to get all orders
app.get('/api/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// API to add a new order
app.post('/api/orders', (req, res) => {
    const { customer_name, items, total } = req.body;
    const query = 'INSERT INTO orders (customer_name, items, total) VALUES (?, ?, ?)';
    db.query(query, [customer_name, JSON.stringify(items), total], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Order saved successfully', id: result.insertId });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
