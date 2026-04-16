import { useState, useEffect, useMemo } from 'react';
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, Package, Clock, CheckCircle2, Truck } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS: Record<string, string> = { Pending: '#E76F51', Shipped: '#84A98C', Delivered: '#2F3E46', Cancelled: '#94a3b8' };

type Range = '7d' | '30d' | '90d' | '12m';

export const AdminDashboardPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('30d');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const [{ data: ordersData }, { data: customersData }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: true }),
        supabase.from('customers').select('*'),
      ]);
      if (ordersData) setOrders(ordersData);
      if (customersData) setCustomers(customersData);
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // --- Derived analytics ---

  // Filter orders within selected range
  const rangeOrders = useMemo(() => {
    const now = Date.now();
    const ms: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 };
    const cutoff = now - ms[range] * 86400000;
    return orders.filter(o => new Date(o.created_at).getTime() >= cutoff && o.status !== 'Cancelled');
  }, [orders, range]);

  // KPI stats
  const stats = useMemo(() => {
    const prevCutoff = Date.now() - (range === '12m' ? 730 : range === '90d' ? 180 : range === '30d' ? 60 : 14) * 86400000;
    const currCutoff = Date.now() - (range === '12m' ? 365 : range === '90d' ? 90 : range === '30d' ? 30 : 7) * 86400000;
    const prevOrders = orders.filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= prevCutoff && t < currCutoff && o.status !== 'Cancelled';
    });
    const revenue = rangeOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    return {
      revenue,
      revenueChange,
      totalOrders: rangeOrders.length,
      ordersChange: prevOrders.length > 0 ? ((rangeOrders.length - prevOrders.length) / prevOrders.length) * 100 : 0,
      customers: customers.length,
      avgOrder: rangeOrders.length > 0 ? revenue / rangeOrders.length : 0,
    };
  }, [rangeOrders, orders, customers, range]);

  // Revenue chart data
  const chartData = useMemo(() => {
    if (range === '12m') {
      const map: Record<string, number> = {};
      MONTH_NAMES.forEach(m => { map[m] = 0; });
      rangeOrders.forEach(o => {
        const m = MONTH_NAMES[new Date(o.created_at).getMonth()];
        map[m] = (map[m] || 0) + Number(o.total || 0);
      });
      return MONTH_NAMES.map(name => ({ name, total: Math.round(map[name]) }));
    }
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      const dayStr = d.toDateString();
      const total = rangeOrders.filter(o => new Date(o.created_at).toDateString() === dayStr).reduce((s, o) => s + Number(o.total || 0), 0);
      return { name: label, total: Math.round(total) };
    }).filter((_, i) => range === '7d' || (range === '30d' ? i % 3 === 0 : i % 7 === 0));
  }, [rangeOrders, range]);

  // Order status breakdown for pie chart
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Best sellers from order_items
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; image?: string }> = {};
    rangeOrders.forEach(o => {
      if (!Array.isArray(o.order_items)) return;
      o.order_items.forEach((item: any) => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0, image: item.image };
        map[item.name].qty += item.quantity;
        map[item.name].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [rangeOrders]);

  // Recent orders
  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [orders]);

  // Monthly orders bar chart
  const ordersBarData = useMemo(() => {
    const map: Record<string, number> = {};
    MONTH_NAMES.forEach(m => { map[m] = 0; });
    orders.forEach(o => { const m = MONTH_NAMES[new Date(o.created_at).getMonth()]; map[m]++; });
    return MONTH_NAMES.map(name => ({ name, orders: map[name] }));
  }, [orders]);

  const StatCard = ({ title, value, change, icon: Icon, color, bg, positive }: any) => (
    <div className="bg-background rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <ArrowUpRight className={`w-3.5 h-3.5 ${!positive && 'rotate-180'}`} />
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>{value}</p>
      </div>
    </div>
  );

  const STATUS_BADGE: Record<string, string> = {
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground text-sm">Real-time analytics from your store's live data.</p>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-1 shadow-sm">
          {(['7d', '30d', '90d', '12m'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {r === '12m' ? '1 Year' : r === '90d' ? '90 Days' : r === '30d' ? '30 Days' : '7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`${stats.revenue.toFixed(0)} DT`} change={stats.revenueChange} positive={stats.revenueChange >= 0} icon={DollarSign} color="text-accent" bg="bg-accent/10" />
        <StatCard title="Orders" value={stats.totalOrders} change={stats.ordersChange} positive={stats.ordersChange >= 0} icon={ShoppingBag} color="text-primary" bg="bg-primary/10" />
        <StatCard title="Customers" value={customers.length} icon={Users} color="text-[#84A98C]" bg="bg-[#84A98C]/10" />
        <StatCard title="Avg. Order Value" value={`${stats.avgOrder.toFixed(0)} DT`} icon={TrendingUp} color="text-indigo-500" bg="bg-indigo-500/10" />
      </div>

      {/* Revenue Chart + Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-background rounded-2xl shadow-sm border border-border p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-foreground">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Revenue from non-cancelled orders in the selected period</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E76F51" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E76F51" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v} DT`} width={65} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: any) => [`${value} DT`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#E76F51" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-lg text-foreground mb-1">Order Breakdown</h3>
          <p className="text-sm text-muted-foreground mb-4">Status distribution of all orders</p>
          {statusData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No orders yet.</div>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any) => [value + ' orders', name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#94a3b8' }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monthly Orders Bar + Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders per Month Bar Chart */}
        <div className="lg:col-span-2 bg-background rounded-2xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-lg text-foreground mb-1">Orders per Month</h3>
          <p className="text-sm text-muted-foreground mb-6">Total order placements by month (all time)</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v: any) => [v, 'Orders']} />
                <Bar dataKey="orders" fill="#84A98C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-lg text-foreground mb-1">Best Sellers</h3>
          <p className="text-sm text-muted-foreground mb-5">Top products by units sold in period</p>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No item-level data yet. Orders need order_items to calculate.</p>
          ) : (
            <div className="space-y-4">
              {bestSellers.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">#{i + 1}</div>
                  {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" onError={e => (e.currentTarget.style.display='none')} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} sold · {p.revenue.toFixed(0)} DT</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Recent Orders</h3>
            <p className="text-sm text-muted-foreground">The 5 most recently placed orders</p>
          </div>
          <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-muted-foreground">No orders yet.</td></tr>
              ) : recentOrders.map((order, i) => (
                <tr key={i} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold">#ORD-{order.id.toString().padStart(3, '0')}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`tel:${order.phone}`} className="text-xs font-medium text-accent hover:underline">{order.phone || 'N/A'}</a>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {order.status === 'Shipped' && <Truck className="w-3 h-3" />}
                      {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                      {order.status === 'Cancelled' && <Package className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{order.total} DT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
