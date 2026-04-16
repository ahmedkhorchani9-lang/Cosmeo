import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Star, Instagram } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<{ name: string; text: string; rating: number }[]>([]);
  const [settings, setSettings] = useState({
    hero_heading: 'Radiate Your Natural Beauty',
    hero_subheading: 'Discover luxury skincare and cosmetics crafted for the modern woman. Premium formulas that enhance your natural glow.',
    hero_banner: 'https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlYXV0eSUyMG5hdHVyYWwlMjBnbG93aW5nJTIwc2tpbnxlbnwxfHx8fDE3NzQ5ODUxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080'
  });

  useEffect(() => {
    const fetchStorefrontData = async () => {
      // Fetch Products
      const { data: products } = await supabase.from('products').select('*').eq('status', 'Active');
      if (products) {
        setFeaturedProducts(products.slice(0, 4));
        setBestSellers(products.slice(-4).reverse());
      }
      
      // Fetch CMS Settings
      const { data: config } = await supabase.from('store_settings').select('hero_heading, hero_subheading, hero_banner').eq('id', 1).single();
      if (config) {
        setSettings({
          hero_heading: config.hero_heading || settings.hero_heading,
          hero_subheading: config.hero_subheading || settings.hero_subheading,
          hero_banner: config.hero_banner || settings.hero_banner
        });
      }

      // Fetch approved testimonials
      const { data: reviews } = await supabase
        .from('reviews')
        .select('customer_name, rating, comment')
        .eq('status', 'Approved')
        .order('created_at', { ascending: false })
        .limit(3);
      if (reviews && reviews.length > 0) {
        setTestimonials(reviews.map(r => ({ name: r.customer_name, rating: r.rating, text: r.comment })));
      }
    };
    fetchStorefrontData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-[600px] lg:h-[700px] bg-gradient-to-br from-[#F8F9FA] via-[#E8EFE9] to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
            <div className="space-y-6 py-12">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-tight" style={{ fontFamily: 'Tan Nimbus, serif' }} dangerouslySetInnerHTML={{__html: settings.hero_heading.replace('Natural Beauty', '<span class="block text-primary">Natural Beauty</span>')}}>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {settings.hero_subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors group">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="inline-flex items-center px-8 py-4 bg-white text-foreground rounded-full hover:bg-secondary transition-colors border border-border">
                  Discover More
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <img src={settings.hero_banner} alt="Beauty" className="rounded-3xl shadow-2xl object-cover w-full h-[550px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Featured Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handpicked favorites for your beauty ritual
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
              Best Sellers
            </h2>
            <p className="text-muted-foreground">
              Our customers' top picks
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors group">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1768818590457-94bc4479bdbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzdHVkaW8lMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc0OTg1MTk2fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Beauty Studio" className="w-full h-[500px] object-cover" />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>
              Where Beauty Meets Luxury
            </h2>
            <p className="text-lg text-muted-foreground">
              At Cosmeo Beauty Studio, we believe that every woman deserves to feel confident 
              and beautiful in her own skin. Our carefully curated collection combines nature's 
              finest ingredients with cutting-edge science.
            </p>
            <Link to="/about" className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors group">
              Our Story
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.text}"</p>
                <p className="text-sm">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary/5 rounded-3xl p-12 lg:p-24 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>Join the Club</h2>
            <p className="text-lg text-muted-foreground">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 bg-white border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary outline-none" />
              <button type="submit" className="bg-primary text-white px-8 py-4 rounded-full hover:bg-primary/90 transition-colors uppercase tracking-wider text-sm font-medium">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
