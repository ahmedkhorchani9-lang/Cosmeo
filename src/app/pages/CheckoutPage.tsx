import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const totalAmount = parseFloat((getTotalPrice() * 1.08).toFixed(2));
      const totalItemCount = getTotalItems();
      
      // Check if customer exists by email
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('*')
        .eq('email', formData.email);
        
      let customerId;

      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update spent and order count
        await supabase.from('customers').update({
            spent: Number(existingCustomers[0].spent || 0) + totalAmount,
            orders_count: Number(existingCustomers[0].orders_count || 0) + 1
        }).eq('id', customerId);
      } else {
        // Create new customer
        const { data: newCustomer, error: customerErr } = await supabase
          .from('customers')
          .insert([{ 
            name: fullName, 
            email: formData.email, 
            phone: formData.phone,
            spent: totalAmount,
            orders_count: 1,
            join_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }])
          .select()
          .single();
          
        if (!customerErr && newCustomer) {
          customerId = newCustomer.id;
        }
      }

      // Create Order
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`.trim();
      const orderItemsSnapshot = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const { error: orderError } = await supabase.from('orders').insert([{
        customer_id: customerId || null,
        customer_name: fullName,
        email: formData.email,
        phone: formData.phone,
        total: totalAmount,
        items: totalItemCount,
        status: 'Pending',
        payment_status: 'Cash on Delivery',
        shipping_address: shippingAddress,
        order_items: orderItemsSnapshot
      }]);

      if (orderError) {
        console.error('Order Insertion Error:', orderError);
        throw new Error(`Order insertion failed: ${orderError.message}`);
      }

      // Decrement stock for each item
      for (const item of items) {
        const { data: productData } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (productData) {
          const newStock = Math.max(0, (productData.stock || 0) - item.quantity);
          await supabase.from('products')
            .update({ 
               stock: newStock,
               status: newStock === 0 ? 'Out of Stock' : undefined // Auto-update status if 0
            })
            .eq('id', item.id);
        }
      }

      // Success!
      clearCart();
      navigate('/order-success');
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      alert(err.message || 'An error occurred during checkout processing.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30 animate-in fade-in duration-500">
      {/* Header */}
      <section className="bg-gradient-to-br from-secondary via-accent/30 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl lg:text-6xl text-center" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Checkout
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
                <h3 className="text-2xl mb-6" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 font-medium">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 font-medium">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 font-medium">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
                <h3 className="text-2xl mb-6" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 font-medium">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-2 font-medium">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 font-medium">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 font-medium">ZIP Code</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 rounded-3xl p-6 shadow-sm border border-primary/20 text-center space-y-2">
                <h3 className="text-xl font-semibold text-primary" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                  Cash on Delivery
                </h3>
                <p className="text-sm text-muted-foreground">
                  You will pay the courier in cash when your order arrives.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? 'Confirming Order...' : 'Confirm Order (COD)'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-24">
              <h3 className="text-2xl mb-6" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                Order Summary
              </h3>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 p-2 hover:bg-muted/30 rounded-xl transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-border bg-muted/50"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {(item.price * item.quantity).toFixed(2)} DT
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-border mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-semibold">{getTotalPrice().toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className="text-primary font-semibold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Tax</span>
                  <span className="font-semibold">{(getTotalPrice() * 0.08).toFixed(2)} DT</span>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-medium">Total</span>
                    <span className="text-primary font-bold" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                      {(getTotalPrice() * 1.08).toFixed(2)} DT
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <div className="flex items-center space-x-3 text-sm text-foreground/80 font-medium bg-secondary/50 p-3 rounded-xl border border-secondary">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Pay Cash on Delivery</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground pl-1">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Free returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
