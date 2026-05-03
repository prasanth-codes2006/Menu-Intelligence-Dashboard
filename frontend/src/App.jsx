import { useState, useEffect } from 'react'

// ---------------------------------------------------------------------------
// All requests go to FastAPI backend (NOT directly to Supabase)
// FastAPI is the ONLY layer that talks to the database.
// ---------------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])

  // Form state
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', cost: '' })
  const [newOrder, setNewOrder] = useState({ item_id: '', quantity: '' })

  // ---------------------------------------------------------------------------
  // Fetch data from FastAPI backend
  // ---------------------------------------------------------------------------

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/`)
      if (!response.ok) throw new Error('Failed to fetch menu items')
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  // Load data on first render
  useEffect(() => {
    fetchMenuItems()
    fetchOrders()
  }, [])

  // ---------------------------------------------------------------------------
  // Add Menu Item → POST to FastAPI
  // ---------------------------------------------------------------------------

  const handleAddMenuItem = async (e) => {
    e.preventDefault()

    const price = parseFloat(newMenuItem.price)
    const cost = parseFloat(newMenuItem.cost)

    // Client-side validation (FastAPI also validates on the backend)
    if (price <= 0 || cost <= 0) {
      alert('Price and Cost must be greater than 0.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/menu/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMenuItem.name,
          price: price,
          cost: cost
        })
      })

      if (response.ok) {
        setNewMenuItem({ name: '', price: '', cost: '' })
        fetchMenuItems() // Refresh the list
      } else {
        const errorData = await response.json()
        alert('Failed to add menu item: ' + (errorData.detail || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding menu item:', error)
      alert('Could not connect to the backend. Is FastAPI running?')
    }
  }

  // ---------------------------------------------------------------------------
  // Add Order → POST to FastAPI
  // ---------------------------------------------------------------------------

  const handleAddOrder = async (e) => {
    e.preventDefault()

    const quantity = parseInt(newOrder.quantity)
    const item_id = parseInt(newOrder.item_id)

    // Client-side validation (FastAPI also validates on the backend)
    if (quantity <= 0) {
      alert('Quantity must be greater than 0.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item_id,
          quantity: quantity
        })
      })

      if (response.ok) {
        setNewOrder({ item_id: '', quantity: '' })
        fetchOrders() // Refresh the list
      } else {
        const errorData = await response.json()
        alert('Failed to add order: ' + (errorData.detail || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding order:', error)
      alert('Could not connect to the backend. Is FastAPI running?')
    }
  }

  // ---------------------------------------------------------------------------
  // Delete Menu Item
  // ---------------------------------------------------------------------------
  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/menu/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchMenuItems();
      } else {
        const errorData = await response.json();
        alert('Failed to delete menu item: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Could not connect to the backend.');
    }
  };

  // ---------------------------------------------------------------------------
  // Delete Order
  // ---------------------------------------------------------------------------
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert('Failed to delete order: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Could not connect to the backend.');
    }
  };

  // ---------------------------------------------------------------------------
  // Helper: get item name by its ID (for the orders table)
  // ---------------------------------------------------------------------------

  const getItemName = (id) => {
    const item = menuItems.find(item => item.id === id)
    return item ? item.name : 'Unknown Item'
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="container">
      <header>
        <h1>Menu Intelligence Dashboard</h1>
        <p>Week 1: Basic Operations</p>
      </header>

      <main className="dashboard">
        {/* -------- Menu Items Section -------- */}
        <section className="card">
          <h2>Menu Items</h2>
          <form onSubmit={handleAddMenuItem} className="form">
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                required
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                placeholder="e.g. Burger"
              />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newMenuItem.cost}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <button type="submit" className="btn">Add Menu Item</button>
          </form>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>₹{Number(item.price).toFixed(2)}</td>
                    <td>₹{Number(item.cost).toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">No menu items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* -------- Orders Section -------- */}
        <section className="card">
          <h2>Orders</h2>
          <form onSubmit={handleAddOrder} className="form">
            <div className="form-group">
              <label>Select Menu Item</label>
              <select
                required
                value={newOrder.item_id}
                onChange={(e) => setNewOrder({ ...newOrder, item_id: e.target.value })}
              >
                <option value="" disabled>-- Select an Item --</option>
                {menuItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                required
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                placeholder="1"
              />
            </div>
            <button type="submit" className="btn">Add Order</button>
          </form>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{getItemName(order.item_id)}</td>
                    <td>{order.quantity}</td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
