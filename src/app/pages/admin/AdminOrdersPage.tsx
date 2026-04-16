import { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle2, Truck, Clock, Package, XCircle, Printer, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  Pending:   { label: 'Pending',   bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
  Shipped:   { label: 'Shipped',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   icon: Truck },
  Delivered: { label: 'Delivered', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  icon: CheckCircle2 },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: XCircle },
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', selectedOrder.id);
    if (!error) {
      setSelectedOrder({ ...selectedOrder, status });
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status } : o));
    }
    setUpdatingStatus(false);
  };

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (Number(o.total) || 0), 0),
  }), [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchQuery ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `ORD-${order.id.toString().padStart(3, '0')}`.includes(searchQuery.toUpperCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handlePrint = () => {
    if (!selectedOrder) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice #ORD-${selectedOrder.id.toString().padStart(3,'0')}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#2F3E46} h1{color:#2F3E46} table{width:100%;border-collapse:collapse;margin-top:20px} td,th{padding:10px;border-bottom:1px solid #eee;text-align:left} .total{font-size:1.2rem;font-weight:bold}</style>
      </head><body>
      <h1>Invoice</h1>
      <p><strong>Order:</strong> #ORD-${selectedOrder.id.toString().padStart(3,'0')}</p>
      <p><strong>Date:</strong> ${new Date(selectedOrder.created_at).toLocaleString()}</p>
      <p><strong>Customer:</strong> ${selectedOrder.customer_name} (${selectedOrder.email})</p>
      ${selectedOrder.shipping_address ? `<p><strong>Ship To:</strong> ${selectedOrder.shipping_address}</p>` : ''}
      <p><strong>Payment:</strong> ${selectedOrder.payment_status}</p>
      ${selectedOrder.order_items?.length > 0 ? `
      <table>
        <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
        <tbody>${selectedOrder.order_items.map((i:any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price} DT</td><td>${(i.price*i.quantity).toFixed(2)} DT</td></tr>`).join('')}</tbody>
      </table>` : ''}
      <p class="total" style="margin-top:20px;text-align:right">Total: ${selectedOrder.total} DT</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>Orders</h2>
        <p className="text-muted-foreground text-sm">Manage and fulfil incoming customer orders in real-time.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Revenue', value: `${stats.revenue.toFixed(0)} DT`, icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-background border border-border p-4 rounded-2xl flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground" style={{ fontFamily: 'Tan Nimbus, serif' }}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="bg-background rounded-2xl shadow-sm border border-border p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or order ID..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-10 py-2 focus:outline-none focus:border-primary text-sm transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {s} {s !== 'All' && <span className="ml-1 opacity-70">({orders.filter(o => o.status === s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                  {searchQuery || statusFilter !== 'All' ? 'No orders match your filters.' : 'No orders yet.'}
                </td></tr>
              ) : filteredOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                const Icon = cfg.icon;
                return (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="px-6 py-4 font-mono font-semibold text-foreground">#ORD-{order.id.toString().padStart(3, '0')}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {order.phone ? (
                        <a href={`tel:${order.phone}`} className="text-sm font-medium text-primary hover:underline" onClick={e => e.stopPropagation()}>{order.phone}</a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <p>{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-xs">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {order.total} DT
                      <span className="block text-xs font-normal text-muted-foreground">{order.items} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <Icon className="w-3.5 h-3.5" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted-foreground">{order.payment_status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors">
                        View
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filteredOrders.length > 0 && (
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground bg-muted/10">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Side Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-in fade-in" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="w-full max-w-lg bg-background h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-semibold text-lg" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                  #ORD-{selectedOrder.id?.toString().padStart(3, '0')}
                </h3>
                <p className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} title="Print Invoice" className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {/* Status Update */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fulfillment Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const isActive = selectedOrder.status === key;
                    return (
                      <button
                        key={key}
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(key)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                          isActive
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} font-semibold`
                            : 'border-border text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{cfg.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {updatingStatus && <p className="text-xs text-muted-foreground text-center">Updating...</p>}
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</h4>
                <div className="bg-muted/30 rounded-xl p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedOrder.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span>
                    <a href={`mailto:${selectedOrder.email}`} className="font-medium text-primary hover:underline">{selectedOrder.email}</a>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span>
                    <a href={`tel:${selectedOrder.phone}`} className="font-medium text-accent hover:underline">{selectedOrder.phone || 'N/A'}</a>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">{selectedOrder.payment_status}</span>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground shrink-0">Ship To</span>
                      <span className="font-medium text-right">{selectedOrder.shipping_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items ({selectedOrder.items})</h4>
                  <span className="font-bold text-lg text-foreground">{selectedOrder.total} DT</span>
                </div>
                {selectedOrder.order_items?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/10">
                        <img
                          src={item.image || ''}
                          alt={item.name}
                          onError={e => (e.currentTarget.style.display='none')}
                          className="w-12 h-12 rounded-lg object-cover bg-muted border border-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {item.price} DT</p>
                        </div>
                        <span className="text-sm font-semibold shrink-0">{(item.price * item.quantity).toFixed(2)} DT</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-border rounded-xl p-4 text-sm text-center text-muted-foreground bg-muted/10">
                    No item breakdown available for this order.
                  </div>
                )}
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex gap-3">
              <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                <Printer className="w-4 h-4" />Print Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
