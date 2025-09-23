#!/usr/bin/env python3
"""
Test script to create and verify orders
"""

import requests
import json

def test_order_creation():
    """Test creating an order via API"""
    print("🧪 Testing Order Creation...")

    # Test data
    order_data = {
        "customer_name": "Test User",
        "customer_phone": "9876543210",
        "customer_address": "123 Test Street",
        "items": [
            {"name": "Tandoori Chicken Pizza", "price": 399, "quantity": 2},
            {"name": "Paneer Tikka Pizza", "price": 349, "quantity": 1}
        ],
        "payment_method": "cash"
    }

    try:
        # Create order
        response = requests.post('http://localhost:5000/api/orders', json=order_data)

        if response.status_code == 201:
            result = response.json()
            print("✅ Order created successfully!")
            print(f"📋 Order ID: {result['order']['id']}")
            print(f"👤 Customer: {result['order']['customer']['name']}")
            print(f"💰 Total Amount: ₹{result['order']['total_amount']}")
            print(f"📍 Address: {result['order']['customer']['address']}")
            return result['order']['id']
        else:
            print(f"❌ Failed to create order: {response.status_code}")
            print(f"Error: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error creating order: {str(e)}")
        return None

def test_get_orders():
    """Test retrieving orders"""
    print("\n🧪 Testing Order Retrieval...")

    try:
        response = requests.get('http://localhost:5000/api/orders')

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Retrieved {result['count']} orders")
            for order in result['orders']:
                print(f"  - Order #{order['id']}: ₹{order['total_amount']} ({order['status']})")
            return True
        else:
            print(f"❌ Failed to retrieve orders: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error retrieving orders: {str(e)}")
        return False

def test_dashboard_stats():
    """Test dashboard statistics"""
    print("\n🧪 Testing Dashboard Stats...")

    try:
        response = requests.get('http://localhost:5000/api/dashboard/stats')

        if response.status_code == 200:
            result = response.json()
            print("✅ Dashboard Stats Retrieved:")
            print(f"  📊 Total Orders: {result['total_orders']}")
            print(f"  👥 Total Customers: {result['total_customers']}")
            print(f"  ⏳ Pending Orders: {result['pending_orders']}")
            print(f"  💰 Total Revenue: ₹{result['total_revenue']}")
            return True
        else:
            print(f"❌ Failed to get dashboard stats: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error getting dashboard stats: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting API Tests...\n")

    # Test dashboard first
    test_dashboard_stats()

    # Create a test order
    order_id = test_order_creation()

    # Test retrieving orders
    test_get_orders()

    # Test dashboard again to see updated stats
    if order_id:
        print("\n📈 Testing updated dashboard after order creation...")
        test_dashboard_stats()

    print("\n🎉 API Testing Complete!")
