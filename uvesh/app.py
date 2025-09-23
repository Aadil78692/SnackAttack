from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db, Customer, Order, init_db, add_sample_data
from datetime import datetime
import json
import os

# Initialize Flask app
app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pizza_orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Enable CORS for frontend integration
CORS(app)

# Initialize database
init_db(app)

# Create tables and sample data on first run
with app.app_context():
    db.create_all()
    # Uncomment the next line if you want sample data
    # add_sample_data()

@app.route('/')
def home():
    return jsonify({"message": "Pizza Ordering API is running!"})

@app.route('/api/customers', methods=['POST'])
def create_customer():
    """Create a new customer"""
    try:
        data = request.get_json()

        if not data or not all(k in data for k in ['name', 'phone', 'address']):
            return jsonify({"error": "Name, phone, and address are required"}), 400

        customer = Customer(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email', ''),
            address=data['address']
        )

        db.session.add(customer)
        db.session.commit()

        return jsonify({
            "message": "Customer created successfully",
            "customer": customer.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()

        if not data or not all(k in data for k in ['customer_name', 'customer_phone', 'customer_address', 'items']):
            return jsonify({"error": "Customer details and items are required"}), 400

        # Create or get customer
        customer = Customer.query.filter_by(phone=data['customer_phone']).first()
        if not customer:
            customer = Customer(
                name=data['customer_name'],
                phone=data['customer_phone'],
                email=data.get('customer_email', ''),
                address=data['customer_address']
            )
            db.session.add(customer)
            db.session.flush()

        # Calculate total amount
        total_amount = sum(item['price'] * item['quantity'] for item in data['items'])

        # Create order
        order = Order(
            customer_id=customer.id,
            items=json.dumps(data['items']),
            total_amount=total_amount,
            payment_method=data.get('payment_method', 'cash'),
            status='pending'
        )

        db.session.add(order)
        db.session.commit()

        return jsonify({
            "message": "Order created successfully",
            "order": order.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders with optional filtering"""
    try:
        # Get query parameters
        status = request.args.get('status')
        customer_phone = request.args.get('customer_phone')

        query = Order.query.join(Customer)

        if status:
            query = query.filter(Order.status == status)
        if customer_phone:
            query = query.filter(Customer.phone == customer_phone)

        orders = query.order_by(Order.created_at.desc()).all()

        return jsonify({
            "orders": [order.to_dict() for order in orders],
            "count": len(orders)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID"""
    try:
        order = Order.query.get_or_404(order_id)
        return jsonify({"order": order.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    try:
        data = request.get_json()

        if not data or 'status' not in data:
            return jsonify({"error": "Status is required"}), 400

        order = Order.query.get_or_404(order_id)
        order.status = data['status']
        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "message": "Order status updated successfully",
            "order": order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    try:
        customers = Customer.query.order_by(Customer.created_at.desc()).all()
        return jsonify({
            "customers": [customer.to_dict() for customer in customers],
            "count": len(customers)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        total_orders = Order.query.count()
        total_customers = Customer.query.count()
        pending_orders = Order.query.filter_by(status='pending').count()
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0

        return jsonify({
            "total_orders": total_orders,
            "total_customers": total_customers,
            "pending_orders": pending_orders,
            "total_revenue": float(total_revenue)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
