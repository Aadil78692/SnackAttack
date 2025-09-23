from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship with orders
    orders = db.relationship('Order', backref='customer', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'created_at': self.created_at.isoformat()
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    items = db.Column(db.Text, nullable=False)  # JSON string of order items
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, preparing, delivered
    payment_method = db.Column(db.String(20), default='cash')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer': self.customer.to_dict() if self.customer else None,
            'items': json.loads(self.items),
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

def init_db(app):
    """Initialize database with the Flask app"""
    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

def add_sample_data():
    """Add sample data for testing"""
    with db.session.begin():
        # Create sample customer
        customer = Customer(
            name="John Doe",
            phone="9016748921",
            email="john@example.com",
            address="123 Main St, Test City"
        )
        db.session.add(customer)
        db.session.flush()  # Get the customer ID

        # Create sample order
        sample_items = [
            {"name": "Tandoori Chicken Pizza", "price": 399, "quantity": 2},
            {"name": "Paneer Tikka Pizza", "price": 349, "quantity": 1}
        ]

        order = Order(
            customer_id=customer.id,
            items=json.dumps(sample_items),
            total_amount=1147.0,
            status="confirmed",
            payment_method="cash"
        )
        db.session.add(order)

        print("Sample data added successfully!")
