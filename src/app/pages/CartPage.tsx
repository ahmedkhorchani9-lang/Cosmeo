import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoStatus('loading');
    const { data } = await supabase
      .from('promos')
      .select('code, discount_type, discount_value, usage_count')
      .eq('code', promoCode.trim().toUpperCase())
      .eq('status', 'Active')
      .single();

    if (data) {
      setAppliedPromo(data);
      setPromoStatus('valid');
      // Increment usage count
      await supabase.from('promos').update({ usage_count: (data.usage_count || 0) + 1 }).eq('code', data.code);
    } else {
      setAppliedPromo(null);
      setPromoStatus('invalid');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoStatus('idle');
  };

  const subtotal = getTotalPrice();
  const discount = appliedPromo
    ? appliedPromo.discount_type === 'Percentage'
      ? subtotal * (appliedPromo.discount_value / 100)
      : Math.min(appliedPromo.discount_value, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors group">
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#F8F9FA] via-[#E8EFE9] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl lg:text-6xl text-center" style={{ fontFamily: 'Tan Nimbus, serif' }}>Shopping Cart</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex gap-6">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-secondary">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${item.id}`} className="text-xl mb-2 hover:text-primary transition-colors block">{item.name}</Link>
                      <p className="text-sm text-muted-foreground uppercase">{item.category}</p>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center space-x-3 bg-secondary rounded-full p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl text-primary mb-2">{(item.price * item.quantity).toFixed(2)} DT</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center">
                          <Trash2 className="w-4 h-4 mr-1" />Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-24 space-y-6">
              <h3 className="text-2xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>Order Summary</h3>

              {/* Promo Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-accent" />Promo Code
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-mono font-bold text-sm text-green-700">{appliedPromo.code}</span>
                      <span className="text-xs text-green-600">
                        {appliedPromo.discount_type === 'Percentage' ? `-${appliedPromo.discount_value}%` : `-${appliedPromo.discount_value} DT`}
                      </span>
                    </div>
                    <button onClick={removePromo} className="text-muted-foreground hover:text-destructive transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoStatus('idle'); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none font-mono text-sm uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoStatus === 'loading' || !promoCode.trim()}
                      className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      {promoStatus === 'loading' ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoStatus === 'invalid' && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />Invalid or expired promo code.
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toFixed(2)} DT</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-{discount.toFixed(2)} DT</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{total.toFixed(2)} DT</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/checkout${appliedPromo ? `?promo=${appliedPromo.code}&discount=${discount.toFixed(2)}` : ''}`}
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors group"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/shop" className="w-full inline-flex items-center justify-center px-8 py-4 bg-secondary text-foreground rounded-full hover:bg-muted transition-colors">
                Continue Shopping
              </Link>
              <p className="text-xs text-muted-foreground text-center">Free shipping on orders over 50 DT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
