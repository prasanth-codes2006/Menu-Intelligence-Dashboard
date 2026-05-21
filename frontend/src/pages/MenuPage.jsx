import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Check, X, ShieldAlert, ShoppingBag, FolderOpen, Calendar, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI, ordersAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import InteractiveModal from '../components/InteractiveModal';

export default function MenuPage({ role }) {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('menu');

  // Modal forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', cost: '' });
  const [addingItem, setAddingItem] = useState(false);

  // Edit item inline states
  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState({ name: '', price: '', cost: '' });

  // Order modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ item_id: '', quantity: '' });
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
      setOrders(orderList);
    } catch (error) {
      toast.error('Failed to load menu items: ' + error.message);
    } finally {
      setTimeout(() => setLoading(false), 400); // Visual buffer
    }
  };

  // ----- Add Item -----
  const handleAddItem = async (e) => {
    e.preventDefault();
    const price = parseFloat(newItem.price);
    const cost = parseFloat(newItem.cost);
    if (price <= 0 || cost <= 0) {
      toast.error('Price and Cost values must be greater than 0');
      return;
    }
    setAddingItem(true);
    try {
      await menuAPI.create({ name: newItem.name, price, cost });
      toast.success(`"${newItem.name}" added to menu catalog!`);
      setNewItem({ name: '', price: '', cost: '' });
      setShowAddModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to add item: ' + error.message);
    } finally {
      setAddingItem(false);
    }
  };

  // ----- Edit Item -----
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditItem({ name: item.name, price: item.price, cost: item.cost });
  };

  const handleUpdateItem = async (id) => {
    const price = parseFloat(editItem.price);
    const cost = parseFloat(editItem.cost);
    if (price <= 0 || cost <= 0) {
      toast.error('Price and Cost must be greater than 0');
      return;
    }
    try {
      await menuAPI.update(id, {
        name: editItem.name,
        price,
        cost,
      });
      toast.success('Menu item updated successfully!');
      setEditingId(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save changes: ' + error.message);
    }
  };

  // ----- Delete Item -----
  const handleDeleteItem = (id, name) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 text-left py-1 text-slate-900 dark:text-slate-100">
        <p className="text-xs font-medium leading-normal">
          Are you sure you want to delete <strong className="text-[#D4AF37]">"{name}"</strong>? This will permanently remove its pricing records.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold border border-border cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors font-sans"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await menuAPI.delete(id);
                toast.success(`"${name}" successfully deleted.`);
                loadData();
              } catch (error) {
                toast.error('Failed to delete: ' + error.message);
              }
            }}
            className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 text-[10px] font-bold text-white cursor-pointer transition-colors font-sans"
          >
            Confirm Delete
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

  // ----- Add Order -----
  const handleAddOrder = async (e) => {
    e.preventDefault();
    const quantity = parseInt(newOrder.quantity);
    const item_id = parseInt(newOrder.item_id);
    if (quantity <= 0) {
      toast.error('Order quantity must be at least 1 unit');
      return;
    }
    setPlacingOrder(true);
    try {
      await ordersAPI.create({ item_id, quantity });
      toast.success('Order placed successfully!');
      setNewOrder({ item_id: '', quantity: '' });
      setShowOrderModal(false);
      loadData();
    } catch (error) {
      toast.error('Order placement failed: ' + error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ----- Delete Order -----
  const handleDeleteOrder = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 text-left py-1 text-slate-900 dark:text-slate-100">
        <p className="text-xs font-medium leading-normal font-sans">
          Remove this order from records? Correcting orders updates monthly revenue metrics.
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
                toast.success('Order deleted successfully.');
                loadData();
              } catch (error) {
                toast.error('Deletion failed: ' + error.message);
              }
            }}
            className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 text-[10px] font-bold text-white cursor-pointer transition-colors font-sans"
          >
            Remove Record
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

  const getItemName = (id) => {
    const item = menuItems.find((m) => m.id === id);
    return item ? item.name : 'Deleted Item';
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = role === 'admin';

  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-fade-up text-left">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-semibold tracking-wide text-slate-900 dark:text-white mb-1">Menu Management</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Manage and refine menu items, pricing, and cost structures.</p>
        </div>

        {/* Info Box if read only */}
        {!isAdmin && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-amber-600/35 bg-amber-500/5 text-amber-600 dark:text-[#D4AF37] text-xs font-semibold shadow-sm self-start">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#D4AF37]" />
            <span>Viewer Mode (Read-only access)</span>
          </div>
        )}
      </div>

      {/* Direct catalog search and Register button */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/50 dark:border-white/5 pb-4 font-sans">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-bold shadow-sm">
          <span>🍽️ Menu Items ({menuItems.length} items registered)</span>
        </div>

        {/* Catalog-specific Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border dark:border-[#D4AF37]/10 bg-white dark:bg-[#16171a]/40 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white transition-all shadow-sm"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Menu Item
            </button>
          )}
        </div>
      </div>

      {/* Main Content wrapper with lazy skeletons */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonLoader type="table" count={5} />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-lg glassmorphism glow-gold-card transition-all duration-300"
          >
            {/* 1. MENU CATALOG TABLE */}
            {activeTab === 'menu' && (
              filteredItems.length > 0 ? (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="saas-table">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Rank</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Item Name</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Price</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Cost</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Profit</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Margin</th>
                        {isAdmin && <th className="text-right font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Actions</th>}
                      </tr>
                    </thead>
                    <motion.tbody
                      variants={tableContainerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredItems.map((item, index) => {
                        const isEditing = editingId === item.id;
                        const margin = item.price - item.cost;
                        const marginPct = item.price > 0 ? ((margin / item.price) * 100).toFixed(1) : 0;

                        return (
                          <motion.tr
                            variants={rowVariants}
                            key={item.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-card/60 transition-colors border-b border-border/50 dark:border-white/5"
                          >
                            <td className="font-extrabold text-slate-400 dark:text-slate-600 w-16">
                              #{index + 1}
                            </td>

                            {/* Name Cell */}
                            <td className="font-serif font-bold text-slate-900 dark:text-white">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editItem.name}
                                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                  className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 text-xs font-semibold text-slate-900 dark:text-white outline-none w-full max-w-xs focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                />
                              ) : (
                                item.name
                              )}
                            </td>

                            {/* Price Cell */}
                            <td className="font-bold text-slate-900 dark:text-white">
                              {isEditing ? (
                                <div className="relative w-28 font-sans">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37]">₹</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editItem.price}
                                    onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                                    className="pl-6 pr-2 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 text-xs font-semibold text-slate-900 dark:text-white outline-none w-full focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                  />
                                </div>
                              ) : (
                                `₹${Number(item.price).toFixed(2)}`
                              )}
                            </td>

                            {/* Cost Cell */}
                            <td className="text-slate-500 dark:text-slate-400 font-medium">
                              {isEditing ? (
                                <div className="relative w-28 font-sans">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37]">₹</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editItem.cost}
                                    onChange={(e) => setEditItem({ ...editItem, cost: e.target.value })}
                                    className="pl-6 pr-2 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 text-xs font-semibold text-slate-900 dark:text-white outline-none w-full focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                  />
                                </div>
                              ) : (
                                `₹${Number(item.cost).toFixed(2)}`
                              )}
                            </td>

                            {/* Margin Cell */}
                            <td className="font-bold text-[#D4AF37]">
                              ₹{margin.toFixed(2)}
                            </td>

                            {/* Margin Percentage Badge */}
                            <td>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                marginPct >= 50
                                  ? 'bg-[#D4AF37]/10 text-amber-600 dark:text-[#D4AF37] border-[#D4AF37]/30'
                                  : marginPct >= 30
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : marginPct >= 15
                                  ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              }`}>
                                {marginPct}%
                              </span>
                            </td>

                            {/* Administrative CRUD Toggles */}
                            {isAdmin && (
                              <td className="text-right">
                                <div className="flex justify-end items-center gap-1.5">
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateItem(item.id)}
                                        className="p-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-sm cursor-pointer active:scale-95 transition-all"
                                        title="Save Changes"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1.5 rounded-lg border border-border dark:border-white/10 bg-slate-50 dark:bg-card hover:bg-slate-100 dark:hover:bg-card/50 text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer active:scale-95 transition-all"
                                        title="Cancel"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEditing(item)}
                                        className="p-1.5 rounded-lg border border-border dark:border-white/10 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-card/50 text-slate-500 hover:text-[#D4AF37] dark:hover:text-[#D4AF37] cursor-pointer transition-colors"
                                        title="Edit Item"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id, item.name)}
                                        className="p-1.5 rounded-lg border border-border dark:border-white/5 bg-white dark:bg-card hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                                        title="Delete Item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
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
                  icon="🍽"
                  title={searchTerm ? 'No Items Found' : 'Menu Empty'}
                  message={searchTerm ? 'Try a different search query.' : 'Populate your menu by adding menu items.'}
                />
              )
            )}

            {/* 2. ORDERS TABLE */}
            {activeTab === 'orders' && (
              orders.length > 0 ? (
                <div className="overflow-x-auto no-scrollbar font-sans">
                  <table className="saas-table">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Order</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Menu Item</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Quantity</th>
                        <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Date</th>
                        {isAdmin && <th className="text-right font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Actions</th>}
                      </tr>
                    </thead>
                    <motion.tbody
                      variants={tableContainerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {orders.map((order, index) => (
                        <motion.tr
                          variants={rowVariants}
                          key={order.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-card/50 transition-colors border-b border-border/50 dark:border-white/5"
                        >
                          <td className="w-16">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-border/60 dark:border-white/10 font-mono shadow-sm">
                              #{index + 1}
                            </span>
                          </td>
                          <td className="font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            {getItemName(order.item_id)}
                          </td>
                          <td>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs bg-[#D4AF37]/10 text-amber-600 dark:text-[#D4AF37] border border-[#D4AF37]/20">
                              {order.quantity} units
                            </span>
                          </td>
                          <td className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-sans">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          {isAdmin && (
                            <td className="text-right">
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 rounded-lg border border-border dark:border-white/5 bg-white dark:bg-card hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                                title="Cancel Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="📦" title="Order History Empty" message="No orders recorded yet. Place orders to see them here." />
              )
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD MENU ITEM MODAL DIALOG --- */}
      <InteractiveModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Menu Item"
      >
        <form onSubmit={handleAddItem} className="space-y-4 text-left font-sans">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Garlic Butter Shrimp"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37]">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="350.00"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                Cost (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37]">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="120.00"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 font-sans">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border border-border dark:border-white/5 hover:border-slate-300 dark:hover:border-[#D4AF37]/40 bg-white dark:bg-card text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold text-xs transition-colors cursor-pointer outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingItem}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/10 transition-all cursor-pointer outline-none disabled:opacity-50"
            >
              {addingItem ? 'Processing...' : 'Add Item'}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* --- ADD ORDER MODAL DIALOG --- */}
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
              <option value="" disabled className="text-slate-500">-- Choose Menu Item --</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id} className="dark:bg-card">{item.name} (₹{Number(item.price).toFixed(2)})</option>
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
              placeholder="e.g. 5"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
            />
          </div>

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
