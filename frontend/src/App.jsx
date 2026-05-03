import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'

function App() {
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])

  // Form state
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', cost: '' })
  const [newOrder, setNewOrder] = useState({ item_id: '', quantity: '' })

  // ---------------------------------------------------------------------------
  // Fetch data from Supabase
  // ---------------------------------------------------------------------------

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching menu items:', error)
    } else {
      setMenuItems(data)
    }
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders(data)
    }
  }

  // Load data on first render
  useEffect(() => {
    fetchMenuItems()
    fetchOrders()
  }, [])

  // ---------------------------------------------------------------------------
  // Add Menu Item (insert into Supabase)
  // ---------------------------------------------------------------------------

  const handleAddMenuItem = async (e) => {
    e.preventDefault()

    const price = parseFloat(newMenuItem.price)
    const cost = parseFloat(newMenuItem.cost)

    // Client-side validation
    if (price <= 0 || cost <= 0) {
      alert('Price and Cost must be greater than 0.')
      return
    }

    const { error } = await supabase
      .from('menu_items')
      .insert([{ name: newMenuItem.name, price, cost }])

    if (error) {
      console.error('Error adding menu item:', error)
      alert('Failed to add menu item: ' + error.message)
    } else {
      setNewMenuItem({ name: '', price: '', cost: '' })
      fetchMenuItems()
    }
  }

  // ---------------------------------------------------------------------------
  // Add Order (insert into Supabase)
  // ---------------------------------------------------------------------------

  const handleAddOrder = async (e) => {
    e.preventDefault()

    const quantity = parseInt(newOrder.quantity)
    const item_id = parseInt(newOrder.item_id)

    // Client-side validation
    if (quantity <= 0) {
      alert('Quantity must be greater than 0.')
      return
    }

    const { error } = await supabase
      .from('orders')
      .insert([{ item_id, quantity }])

    if (error) {
      console.error('Error adding order:', error)
      alert('Failed to add order: ' + error.message)
    } else {
      setNewOrder({ item_id: '', quantity: '' })
      fetchOrders()
    }
  }

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
        <p>Week 1: Basic Operations &nbsp;·&nbsp; Powered by Supabase</p>
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
              <label>Price ($)</label>
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
              <label>Cost ($)</label>
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
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>${Number(item.cost).toFixed(2)}</td>
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
