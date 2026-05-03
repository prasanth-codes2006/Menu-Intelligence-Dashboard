-- =============================================
-- Database Schema for Menu Intelligence Dashboard
-- Run this in the Supabase SQL Editor
-- =============================================

-- Table: menu_items
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    cost DECIMAL(10, 2) NOT NULL CHECK (cost > 0)
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    date TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Sample Data (Optional - run after creating tables)
-- =============================================

INSERT INTO menu_items (name, price, cost) VALUES
    ('Classic Burger', 12.99, 5.50),
    ('Caesar Salad', 9.99, 3.20),
    ('Margherita Pizza', 14.99, 6.00),
    ('Grilled Chicken', 16.99, 7.50),
    ('French Fries', 5.99, 1.80);

INSERT INTO orders (item_id, quantity) VALUES
    (1, 10),
    (2, 5),
    (3, 8),
    (4, 3),
    (5, 15),
    (1, 7),
    (3, 4);
