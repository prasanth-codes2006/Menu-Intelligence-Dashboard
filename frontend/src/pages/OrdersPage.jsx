import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Calendar, ShoppingBag, ShieldAlert, Award, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI, ordersAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import InteractiveModal from '../components/InteractiveModal';

export default function OrdersPage({ role }) {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create order states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ item_id: '', quantity: '1' });
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, orderList] = await Promise.all([
        menuAPI.getAll(),
        ordersAPI.getAll(),
      ]);
      setMenuItems(items);
      
      // Sort orders by date or ID descending so newest appear first
      const sortedOrders = [...orderList].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
      setOrders(sortedOrders);
    } catch (error) {
      toast.error('Failed to retrieve order records: ' + error.message);
    } finally {
      setTimeout(() => setLoading(false), 450); // Visual buffer for smooth entrance
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    const quantity = parseInt(newOrder.quantity);
    const item_id = parseInt(newOrder.item_id);
    
    if (!item_id) {
      toast.error('Please select a menu item');
      return;
    }
    if (quantity <= 0) {
      toast.error('Order quantity must be at least 1 unit');
      return;
    }

    setPlacingOrder(true);
    try {
      await ordersAPI.create({ item_id, quantity });
      
      const item = menuItems.find(m => m.id === item_id);
      toast.success(`Order for ${quantity}x "${item ? item.name : 'Item'}" logged!`);
      
      setNewOrder({ item_id: '', quantity: '1' });
      setShowOrderModal(false);
      loadData();
    } catch (error) {
      toast.error('Order logging failed: ' + error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleDeleteOrder = (id, itemName, totalBill) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 text-left py-1 text-slate-900 dark:text-slate-100">
        <p className="text-xs font-medium leading-normal">
          Cancel order for <strong className="text-[#D4AF37]">"{itemName}"</strong> worth <span className="text-[#D4AF37] font-semibold">₹{totalBill}</span>? This will update monthly revenue metrics.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold border border-border cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors font-sans"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await ordersAPI.delete(id);
                toast.success('Order successfully canceled.');
                loadData();
              } catch (error) {
                toast.error('Failed to cancel order: ' + error.message);
              }
            }}
            className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 text-[10px] font-bold text-white cursor-pointer transition-colors font-sans"
          >
            Cancel Order
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        maxWidth: '360px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }
    });
  };

  // Client-side joins
  const getItemDetails = (id) => {
    return menuItems.find((m) => m.id === id) || { name: 'Item Deleted', price: 0, cost: 0 };
  };

  const filteredOrders = orders.filter((order) => {
    const item = getItemDetails(order.item_id);
    const searchString = searchTerm.toLowerCase();
    const formattedDate = new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase();
    const orderIndex = orders.indexOf(order) + 1;
    const orderNumberStr = `#${orderIndex}`;
    
    return (
      item.name.toLowerCase().includes(searchString) ||
      orderNumberStr.includes(searchString) ||
      orderIndex.toString() === searchString ||
      formattedDate.includes(searchString)
    );
  });

  const isAdmin = role === 'admin';

  // Math metrics for summary panel
  const totalRevenue = orders.reduce((sum, order) => {
    const item = getItemDetails(order.item_id);
    return sum + (order.quantity * item.price);
  }, 0);

  const totalMargin = orders.reduce((sum, order) => {
    const item = getItemDetails(order.item_id);
    return sum + (order.quantity * (item.price - item.cost));
  }, 0);

  const averageBill = orders.length > 0 ? (totalRevenue / orders.length) : 0;

  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-fade-up text-left">
      
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-semibold tracking-wide text-slate-900 dark:text-white mb-1">Orders</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Track and manage active orders, sales revenue, and margins.</p>
        </div>

        {/* Read-Only Status Badge */}
        {!isAdmin ? (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-semibold shadow-sm self-start font-sans">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#D4AF37]" />
            <span>Viewer Mode (Read-only access)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm self-start font-sans">
            <Award className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Admin Access Enabled</span>
          </div>
        )}
      </div>

      {/* 2. Stat Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mb-1">Total Revenue</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-[#D4AF37] font-semibold mt-1 flex items-center gap-1">
              <span>Gross revenue from {orders.length} orders</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mb-1">Total Profit</p>
            <h3 className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">₹{totalMargin.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Profit Margin: <strong className="text-emerald-500 font-sans">{totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0}%</strong> of revenue
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mb-1">Average Order Value</p>
            <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">₹{averageBill.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Average ticket size per order</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border/50 dark:border-white/5 pb-4 font-sans">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by item name, date, or order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border dark:border-[#D4AF37]/10 bg-white dark:bg-card/40 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white transition-all shadow-sm"
          />
        </div>

        {/* Add Button */}
        {isAdmin && (
          <button
            onClick={() => setShowOrderModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log New Order
          </button>
        )}
      </div>

      {/* 4. Table Ledgers */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonLoader type="table" count={5} />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card transition-all duration-300"
          >
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto no-scrollbar">
                <table className="saas-table">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/20">
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Order</th>
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Menu Item</th>
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Quantity</th>
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Price</th>
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Total Price</th>
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Profit</th>
                      <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Date</th>
                      {isAdmin && <th className="text-right font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Actions</th>}
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={tableContainerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredOrders.map((order, index) => {
                      const item = getItemDetails(order.item_id);
                      const totalBill = order.quantity * item.price;
                      const totalCost = order.quantity * item.cost;
                      const profitMargin = totalBill - totalCost;

                      return (
                        <motion.tr
                          variants={rowVariants}
                          key={order.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-card/50 transition-colors border-b border-border/50 dark:border-white/5"
                        >
                          <td className="w-24">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-border/60 dark:border-white/10 font-mono shadow-sm">
                              #{index + 1}
                            </span>
                          </td>
                          <td className="font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            {item.name}
                          </td>
                          <td className="font-sans">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-border/50 dark:border-white/5">
                              {order.quantity} units
                            </span>
                          </td>
                          <td className="text-slate-500 dark:text-slate-400 font-semibold font-sans">
                            ₹{Number(item.price).toFixed(2)}
                          </td>
                          <td className="font-bold text-slate-900 dark:text-white font-sans">
                            ₹{totalBill.toFixed(2)}
                          </td>
                          <td className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                            +₹{profitMargin.toFixed(2)}
                          </td>
                          <td className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-sans">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          {isAdmin && (
                            <td className="text-right">
                              <button
                                onClick={() => handleDeleteOrder(order.id, item.name, totalBill.toFixed(2))}
                                className="p-1.5 rounded-lg border border-border dark:border-white/5 bg-white dark:bg-card hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                                title="Cancel Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                icon="📦" 
                title={searchTerm ? 'No Orders Found' : 'Orders Empty'} 
                message={searchTerm ? 'Try a different search query or filter.' : 'Add new menu items and place orders to start tracking orders.'} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD ORDER MODAL --- */}
      <InteractiveModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Log New Order"
      >
        <form onSubmit={handleAddOrder} className="space-y-4 text-left font-sans">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
              Menu Item
            </label>
            <select
              required
              value={newOrder.item_id}
              onChange={(e) => setNewOrder({ ...newOrder, item_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none text-slate-900 dark:text-white focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
            >
              <option value="" disabled>-- Select Menu Item --</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id} className="dark:bg-card text-slate-900 dark:text-white font-sans">
                  {item.name} (₹{Number(item.price).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
              Quantity
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 1"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick billing summary */}
          {newOrder.item_id && newOrder.quantity > 0 && (
            <div className="p-4 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 space-y-1 text-xs">
              <p className="text-slate-400 flex justify-between">
                <span>Unit Price:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{Number(getItemDetails(parseInt(newOrder.item_id)).price).toFixed(2)}</span>
              </p>
              <p className="text-slate-400 flex justify-between">
                <span>Quantity:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">x{newOrder.quantity}</span>
              </p>
              <div className="h-[1px] bg-[#D4AF37]/15 my-2" />
              <p className="font-bold text-[#D4AF37] flex justify-between text-sm uppercase tracking-wide">
                <span>Estimated Price:</span>
                <span>₹{(getItemDetails(parseInt(newOrder.item_id)).price * parseInt(newOrder.quantity)).toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4">
            <button
              type="button"
              onClick={() => setShowOrderModal(false)}
              className="px-4 py-2 rounded-xl border border-border dark:border-white/5 hover:border-slate-300 dark:hover:border-[#D4AF37]/40 bg-white dark:bg-card text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold text-xs transition-colors cursor-pointer outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={placingOrder}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/10 transition-all cursor-pointer outline-none disabled:opacity-50"
            >
              {placingOrder ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </InteractiveModal>

    </div>
  );
}
