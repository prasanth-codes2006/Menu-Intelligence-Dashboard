import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  
  // Forms state
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', cost: '' })
  const [newOrder, setNewOrder] = useState({ item_id: '', quantity: '' })

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/`)
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  useEffect(() => {
    fetchMenuItems()
    fetchOrders()
  }, [])

  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/menu/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMenuItem.name,
          price: parseFloat(newMenuItem.price),
          cost: parseFloat(newMenuItem.cost)
        })
      })
      if (response.ok) {
        fetchMenuItems()
        setNewMenuItem({ name: '', price: '', cost: '' })
      } else {
        alert("Failed to add menu item. Ensure price and cost > 0.")
      }
    } catch (error) {
      console.error("Error adding menu item:", error)
    }
  }

  const handleAddOrder = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: parseInt(newOrder.item_id),
          quantity: parseInt(newOrder.quantity)
        })
      })
      if (response.ok) {
        fetchOrders()
        setNewOrder({ item_id: '', quantity: '' })
      } else {
        alert("Failed to add order. Ensure quantity > 0 and item is selected.")
      }
    } catch (error) {
      console.error("Error adding order:", error)
    }
  }

  // Get item name by ID for order table
  const getItemName = (id) => {
    const item = menuItems.find(item => item.id === id)
    return item ? item.name : 'Unknown Item'
  }

  return (
    <div className="container">
      <header>
        <h1>Menu Intelligence Dashboard</h1>
        <p>Week 1: Basic Operations</p>
      </header>

      <main className="dashboard">
        {/* Menu Items Section */}
        <section className="card">
          <h2>Menu Items</h2>
          <form onSubmit={handleAddMenuItem} className="form">
            <div className="form-group">
              <label>Item Name</label>
              <input 
                type="text" 
                required 
                value={newMenuItem.name} 
                onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})} 
                placeholder="e.g. Burger"
              />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={newMenuItem.price} 
                onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})} 
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Cost ($)</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={newMenuItem.cost} 
                onChange={(e) => setNewMenuItem({...newMenuItem, cost: e.target.value})} 
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
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.cost.toFixed(2)}</td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">No menu items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orders Section */}
        <section className="card">
          <h2>Orders</h2>
          <form onSubmit={handleAddOrder} className="form">
            <div className="form-group">
              <label>Select Menu Item</label>
              <select 
                required 
                value={newOrder.item_id} 
                onChange={(e) => setNewOrder({...newOrder, item_id: e.target.value})}
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
                onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})} 
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
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{getItemName(order.item_id)}</td>
                    <td>{order.quantity}</td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">No orders found.</td>
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
