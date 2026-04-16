import { useState, useEffect, useMemo } from 'react';
import { Search, X, Mail, Phone, Calendar, ShoppingBag, Clock, CheckCircle2, Truck, XCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  Pending:   { label: 'Pending',   bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
  Shipped:   { label: 'Shipped',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   icon: Truck },
  Delivered: { label: 'Delivered', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  icon: CheckCircle2 },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: XCircle },
};

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch orders for selected customer
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerOrders([]);
      return;
    }

    const fetchCustomerOrders = async () => {
      setLoadingOrders(true);
      // Try fetching by customer_id first
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', selectedCustomer.id)
        .order('created_at', { ascending: false });
      
      // Fallback: If no orders found by ID, try by email (accounts for orphaned mock data)
      if (!error && (!data || data.length === 0)) {
        const { data: emailData } = await supabase
          .from('orders')
          .select('*')
          .eq('email', selectedCustomer.email)
          .order('created_at', { ascending: false });
        if (emailData) data = emailData;
      }

      if (data) setCustomerOrders(data);
      setLoadingOrders(false);
    };

    fetchCustomerOrders();
  }, [selectedCustomer]);

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Customers
          </h2>
          <p className="text-muted-foreground text-sm">View customer profiles and their purchase histories.</p>
        </div>
      </div>

      <div className="bg-background rounded-2xl shadow-sm border border-border p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary text-sm transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {customer.name?.charAt(0) || 'U'}
                      </div>
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{customer.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-foreground text-xs font-medium border border-border">
                        {customer.orders_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{customer.spent} DT</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in" onClick={(e) => e.target === e.currentTarget && setSelectedCustomer(null)}>
          <div className="w-full max-w-lg bg-background h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                  {selectedCustomer.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ fontFamily: 'Tan Nimbus, serif' }}>{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">Customer ID: #{selectedCustomer.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Contact Information */}
              <div className="bg-muted/30 rounded-2xl p-5 space-y-4 border border-border/50">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Contact Details</h4>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-border/50">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">Email Address</p>
                    <a href={`mailto:${selectedCustomer.email}`} className="hover:text-primary transition-colors block truncate">{selectedCustomer.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-border/50">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">Phone Number</p>
                    <a href={`tel:${selectedCustomer.phone}`} className="hover:text-accent transition-colors block">
                      {selectedCustomer.phone || 'N/A'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-border/50">
                    <Calendar className="w-4 h-4 text-[#84A98C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">Member Since</p>
                    <span className="block">{selectedCustomer.join_date || new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border rounded-2xl p-5 text-center bg-background shadow-sm group hover:border-primary transition-colors">
                  <div className="text-3xl font-bold text-foreground mb-1 group-hover:scale-110 transition-transform" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                    {selectedCustomer.orders_count}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Orders</div>
                </div>
                <div className="border border-border rounded-2xl p-5 text-center bg-background shadow-sm group hover:border-accent transition-colors">
                  <div className="text-3xl font-bold text-accent mb-1 group-hover:scale-110 transition-transform" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                    {selectedCustomer.spent}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Spent (DT)</div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order History</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-muted rounded-full">
                    {customerOrders.length} records
                  </span>
                </div>
                
                <div className="space-y-3">
                  {loadingOrders ? (
                    <div className="text-center py-10">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
                      <p className="text-sm text-muted-foreground">Loading order history...</p>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-2xl">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No orders found for this customer.</p>
                    </div>
                  ) : (
                    customerOrders.map((order) => {
                      const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                      const Icon = cfg.icon;
                      return (
                        <div key={order.id} className="bg-background border border-border rounded-xl p-4 hover:shadow-md transition-all group overflow-hidden relative">
                          <div className={`absolute top-0 right-0 w-1 h-full ${cfg.bg.replace('bg-', 'bg-')}`}></div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-foreground">#ORD-{order.id.toString().padStart(3, '0')}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter mb-0.5">Order Total</p>
                              <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'Tan Nimbus, serif' }}>{order.total} DT</p>
                            </div>
                            <button 
                              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="View Order Details"
                              onClick={() => {
                                // Potentially navigate to orders page with search query or just close and allow admin to find it
                                alert(`Redirecting to Order Details #ORD-${order.id.toString().padStart(3, '0')} would happen here.`);
                              }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/10">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-full px-4 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
              >
                Close Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
