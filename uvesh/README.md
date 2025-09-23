# 🍕 Spice & Slice - Pizza Ordering System with Database

A complete pizza ordering website with backend database integration for storing customer orders, addresses, and details.

## 🚀 Features

- **Complete Pizza Ordering Website** - Beautiful frontend with Indian fusion pizzas
- **Database Integration** - SQLite database for storing orders and customer data
- **REST API** - Full backend API for order management
- **Cart Management** - Dynamic cart with local storage
- **Order Tracking** - Store and retrieve customer orders
- **Customer Management** - Store customer details and order history

## 📁 Project Structure

```
├── INDEX.HTML              # Main website frontend
├── app.py                  # Flask backend API
├── database.py             # Database models and connection
├── requirements.txt        # Python dependencies
├── test_database.py        # Database testing script
├── static/
│   └── js/
│       └── api.js          # Frontend API integration
└── pizza_orders.db         # SQLite database (created automatically)
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Database Tests
```bash
python test_database.py
```

### 3. Start the Backend Server
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### 4. Open the Website
Open `INDEX.HTML` in your web browser to access the pizza ordering website.

## 🔌 API Endpoints

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/<id>` - Get specific order
- `PUT /api/orders/<id>/status` - Update order status

### Customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers` - Get all customers

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 📊 Database Schema

### Customer Table
- `id` - Primary key
- `name` - Customer name
- `phone` - Phone number
- `email` - Email address
- `address` - Delivery address
- `created_at` - Registration date

### Order Table
- `id` - Primary key
- `customer_id` - Foreign key to customer
- `items` - JSON string of order items
- `total_amount` - Total order amount
- `status` - Order status (pending, confirmed, preparing, delivered)
- `payment_method` - Payment method
- `created_at` - Order date
- `updated_at` - Last update

## 🎯 How to Use

1. **Browse Menu** - View all available pizzas with prices
2. **Add to Cart** - Click "Add to Cart" on any pizza
3. **Review Cart** - See all items and total in the cart section
4. **Place Order** - Fill delivery details and submit order
5. **Order Storage** - All orders are automatically saved to database

## 🧪 Testing

Run the test script to verify database functionality:
```bash
python test_database.py
```

## 📱 Features Implemented

✅ **Frontend**
- Responsive pizza ordering website
- Dynamic cart management
- Order form with validation
- Real-time cart updates

✅ **Backend**
- Flask REST API
- SQLite database integration
- Customer and order management
- JSON API responses

✅ **Database**
- Customer data storage
- Order history tracking
- Order status management
- Fast SQLite queries

✅ **Integration**
- Frontend-backend communication
- Error handling
- Success/error messages
- Data persistence

## 🔧 Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Python, Flask
- **Database**: SQLite with SQLAlchemy ORM
- **API**: RESTful JSON API

## 📞 Support

For any issues or questions, contact:
- Phone: +91 90167 48921
- Email: samirsamir0204@gmail.com
- Address: 25, Karuna Sagar Complex Sathamba 383340

---

**Ready to take orders! 🚀**
