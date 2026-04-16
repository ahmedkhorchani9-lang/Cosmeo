import { useEffect, useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LayoutTemplate, 
  Tag, 
  Star, 
  Settings, 
  Search, 
  Bell, 
  UserCircle,
  ShoppingCart,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/admin/login', { replace: true });
    }
  }, [loading, session, navigate]);

  // Fetch recent orders as notifications
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(o => o.status === 'Pending').length);
    }
  };

  useEffect(() => {
    if (session) fetchNotifications();
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Content', path: '/admin/content', icon: LayoutTemplate },
    { name: 'Discounts', path: '/admin/discounts', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground font-medium animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex animate-in fade-in duration-300">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-10 flex flex-col">
        <div className="h-24 flex items-center px-6 border-b border-sidebar-border">
          <Link to="/admin" className="block">
            <img src="/logo.png" alt="Cosmeo Beauty" className="h-14 w-auto object-contain" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-6 hide-scrollbar px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                    : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-border'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-border hover:text-sidebar-foreground transition-all"
          >
            <UserCircle className="w-5 h-5 text-sidebar-foreground/70" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-8 shrink-0 shadow-sm z-10 sticky top-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-full bg-muted/50 border border-border rounded-full pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-all text-sm"
            />
          </div>
          <div className="flex items-center space-x-6 ml-8">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => { setShowNotifs(v => !v); setUnreadCount(0); }}
                className="relative p-2 text-foreground/70 hover:text-primary transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full ring-2 ring-background text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">Recent Orders</h3>
                    <Link 
                      to="/admin/orders" 
                      onClick={() => setShowNotifs(false)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">No orders yet</div>
                    ) : (
                      notifications.map(n => (
                        <Link
                          key={n.id}
                          to="/admin/orders"
                          onClick={() => setShowNotifs(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0"
                        >
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            n.status === 'Delivered' ? 'bg-green-100' : n.status === 'Shipped' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            {n.status === 'Delivered' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : n.status === 'Shipped' ? (
                              <ShoppingCart className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              New order from {n.customer_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {n.total} DT · <span className={`font-medium ${
                                n.status === 'Pending' ? 'text-yellow-600' : n.status === 'Shipped' ? 'text-blue-600' : 'text-green-600'
                              }`}>{n.status}</span>
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.email || "Admin User"}</p>
                <p className="text-xs text-muted-foreground">Store Manager</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
