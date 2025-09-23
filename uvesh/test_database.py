#!/usr/bin/env python3
"""
Test script to verify database connection and functionality
"""

from app import app
from database import db, Customer, Order, add_sample_data
import json

def test_database_connection():
    """Test basic database operations"""
    print("🧪 Testing Database Connection...")

    with app.app_context():
        try:
            # Test database connection
            db.create_all()
            print("✅ Database tables created successfully!")

            # Test adding a customer
            customer = Customer(
                name="Test Customer",
                phone="9876543210",
                email="test@example.com",
                address="Test Address, Test City"
            )
            db.session.add(customer)
            db.session.commit()
            print("✅ Customer added successfully!")

            # Test adding an order
            test_items = [
                {"name": "Tandoori Chicken Pizza", "price": 399, "quantity": 1},
                {"name": "Paneer Tikka Pizza", "price": 349, "quantity": 1}
            ]

            order = Order(
                customer_id=customer.id,
                items=json.dumps(test_items),
                total_amount=748.0,
                status="confirmed",
                payment_method="cash"
            )
            db.session.add(order)
            db.session.commit()
            print("✅ Order added successfully!")

            # Test retrieving data
            customers = Customer.query.all()
            orders = Order.query.all()
            print(f"✅ Retrieved {len(customers)} customers and {len(orders)} orders")

            # Clean up test data
            db.session.delete(order)
            db.session.delete(customer)
            db.session.commit()
            print("✅ Test data cleaned up")

            print("\n🎉 All database tests passed!")
            return True

        except Exception as e:
            print(f"❌ Database test failed: {str(e)}")
            return False

if __name__ == "__main__":
    test_database_connection()
