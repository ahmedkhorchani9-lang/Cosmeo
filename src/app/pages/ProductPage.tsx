import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Star, ShoppingBag, Heart, Minus, Plus, Check, SendHorizonal, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');

  // Review form state
  const [reviewForm, setReviewForm] = useState({ customer_name: '', comment: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchReviews = async (productName: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('id, customer_name, rating, comment, created_at')
      .eq('status', 'Approved')
      .eq('product_name', productName)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', Number(id)).single();
      if (data && !error) {
        setProduct(data);
        setActiveImage(data.image);
        const { data: related } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(4);
        if (related) setRelatedProducts(related);
        await fetchReviews(data.name);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert([{
      customer_name: reviewForm.customer_name,
      product_name: product.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      status: 'Pending'
    }]);

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setReviewForm({ customer_name: '', comment: '', rating: 5 });
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (product?.rating || 5).toFixed(1);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground text-lg">Loading product...</p></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Link to="/shop" className="text-primary hover:underline">Return to shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden bg-secondary aspect-square relative group bg-muted/20">
              <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl">Out of Stock</span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{product.category}</span>
                {isOutOfStock ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-tight border border-red-200">Out of Stock</span>
                ) : product.bestSeller && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-tight">Best Seller</span>
                )}
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>{product.name}</h1>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <p className="text-4xl text-primary font-bold">{Number(product.price).toFixed(2)} DT</p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description || "A wonderful addition to your beauty collection carefully constructed with natural elements."}
            </p>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quantity</span>
                <div className="flex items-center space-x-3 bg-secondary rounded-2xl p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white transition-all shadow-sm active:scale-95">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{product.stock} units available</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart} 
                disabled={isOutOfStock}
                className={`flex-1 inline-flex items-center justify-center px-8 py-4 rounded-full transition-all group font-bold ${
                  isOutOfStock 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed grayscale' 
                  : 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isOutOfStock ? (
                  <><ImageIcon className="mr-2 w-5 h-5 opacity-50" />Out of Stock</>
                ) : addedToCart ? (
                  <><Check className="mr-2 w-5 h-5" />Added to Cart</>
                ) : (
                  <><ShoppingBag className="mr-2 w-5 h-5" />Add to Cart</>
                )}
              </button>
              <button className="px-6 py-4 bg-secondary rounded-full hover:bg-accent transition-all active:scale-95">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Product Features */}
            <div className="bg-secondary rounded-3xl p-6 space-y-3">
              {['Cruelty-free & Vegan', 'Dermatologist Tested', 'Free Shipping on Orders Over 50 DT', '30-Day Money Back Guarantee'].map(f => (
                <div key={f} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Existing Reviews */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl mb-3" style={{ fontFamily: 'Tan Nimbus, serif' }}>Customer Reviews</h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-muted-foreground">{avgRating} out of 5 · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No approved reviews yet. Be the first to write one!</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm animate-in zoom-in-95 duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <h4 className="font-medium">{review.customer_name}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs">
                              <Check className="w-3 h-3 mr-1 text-primary" />Verified
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">"{review.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submit Review Form */}
            <div>
              <h2 className="text-3xl lg:text-4xl mb-8" style={{ fontFamily: 'Tan Nimbus, serif' }}>Write a Review</h2>

              {submitted ? (
                <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-primary/20 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thank you for your review!</h3>
                  <p className="text-muted-foreground text-sm">Your review has been submitted and is awaiting approval. It will appear here shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 text-primary hover:underline text-sm font-medium">Write another review</button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.customer_name}
                      onChange={e => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                      placeholder="e.g. Sarah Johnson"
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 ${(hoverRating || reviewForm.rating) >= star ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || reviewForm.rating]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this product..."
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium shadow-xl shadow-primary/10"
                  >
                    <SendHorizonal className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <p className="text-xs text-muted-foreground text-center">Reviews are moderated and will appear after approval.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl lg:text-4xl mb-12" style={{ fontFamily: 'Tan Nimbus, serif' }}>You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
