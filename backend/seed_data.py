"""
Seed Script — Populates the database with realistic demo data.

Generates:
  - 15 diverse menu items across categories
  - 100+ orders spanning multiple months
  - Varied quantities to create interesting analytics patterns

Run: python -m backend.seed_data
"""

import random
from datetime import datetime, timedelta

from .database import SessionLocal
from . import models


# ---------------------------------------------------------------------------
# Sample Menu Items — Realistic restaurant items with varying margins
# ---------------------------------------------------------------------------

MENU_ITEMS = [
    # (name, price, cost) — mix of high/low margins and price points
    ("Classic Burger", 12.99, 5.50),
    ("Caesar Salad", 9.99, 3.20),
    ("Margherita Pizza", 14.99, 6.00),
    ("Grilled Chicken", 16.99, 7.50),
    ("French Fries", 5.99, 1.80),
    ("Pasta Carbonara", 13.99, 5.00),
    ("Fish & Chips", 15.99, 9.00),       # Low margin
    ("Mushroom Soup", 7.99, 2.50),
    ("Steak Sandwich", 18.99, 12.00),     # Low margin
    ("Veggie Wrap", 10.99, 3.50),
    ("Chocolate Brownie", 6.99, 2.00),
    ("Iced Coffee", 4.99, 1.20),
    ("Mango Smoothie", 6.49, 2.80),
    ("Garlic Bread", 4.49, 3.50),         # Very low margin
    ("Grilled Salmon", 22.99, 14.00),     # Low margin
]


def seed_database():
    """Insert sample menu items and orders into the database."""
    db = SessionLocal()

    try:
        # Check if data already exists
        existing_items = db.query(models.MenuItem).count()
        if existing_items > 0:
            print(f"⚠️  Database already has {existing_items} menu items. Skipping seed.")
            print("   To re-seed, clear the tables first.")
            return

        print("🌱 Seeding database with demo data...")

        # --- Insert menu items ---
        db_items = []
        for name, price, cost in MENU_ITEMS:
            item = models.MenuItem(name=name, price=price, cost=cost)
            db.add(item)
            db_items.append(item)

        db.commit()
        # Refresh to get generated IDs
        for item in db_items:
            db.refresh(item)

        print(f"   ✅ Added {len(db_items)} menu items")

        # --- Generate orders across multiple months ---
        # Create orders spanning the last 6 months
        today = datetime.utcnow()
        orders_created = 0

        for months_ago in range(6, -1, -1):  # 6 months ago to now
            # Base date for this month
            base = today - timedelta(days=months_ago * 30)

            # Each month: generate 15-25 random orders
            num_orders = random.randint(15, 25)

            for _ in range(num_orders):
                item = random.choice(db_items)

                # Weight quantities: some items sell more than others
                # Burgers, fries, and coffee sell the most
                if item.name in ("Classic Burger", "French Fries", "Iced Coffee"):
                    quantity = random.randint(3, 8)
                elif item.name in ("Garlic Bread", "Grilled Salmon"):
                    quantity = random.randint(1, 2)  # Low sellers
                else:
                    quantity = random.randint(1, 5)

                # Random date within the month
                day_offset = random.randint(0, 29)
                order_date = base + timedelta(days=day_offset)

                order = models.Order(
                    item_id=item.id,
                    quantity=quantity,
                    date=order_date,
                )
                db.add(order)
                orders_created += 1

        db.commit()
        print(f"   ✅ Added {orders_created} orders across 7 months")
        print("🎉 Database seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
